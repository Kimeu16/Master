import Papa from "papaparse";
import { Site, User, EscalationEntry, ChecklistTask, RevisionSummary } from "@/types/site";

// Published Google Sheets CSV URLs
const SITES_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJ9ghNuvsFsz5CZLIjMr2cHKPvhH3OVt8OJMRe0om7YPtflOiYGJSmZBACydF5IQ/pub?gid=1127743265&single=true&output=csv";
const USERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJ9ghNuvsFsz5CZLIjMr2cHKPvhH3OVt8OJMRe0om7YPtflOiYGJSmZBACydF5IQ/pub?gid=1852918422&single=true&output=csv";
const ESCALATIONS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJ9ghNuvsFsz5CZLIjMr2cHKPvhH3OVt8OJMRe0om7YPtflOiYGJSmZBACydF5IQ/pub?gid=82484373&single=true&output=csv";
const PM_CHECKLIST_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJ9ghNuvsFsz5CZLIjMr2cHKPvhH3OVt8OJMRe0om7YPtflOiYGJSmZBACydF5IQ/pub?gid=1920086774&single=true&output=csv";
const REVISION_SUMMARY_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJ9ghNuvsFsz5CZLIjMr2cHKPvhH3OVt8OJMRe0om7YPtflOiYGJSmZBACydF5IQ/pub?gid=786428941&single=true&output=csv";

/**
 * Maps Google Sheet column headers to camelCase field names used in the app.
 */
const SITES_HEADER_MAP: Record<string, string> = {
  "No": "no",
  "Site Name": "siteName",
  "Power Source": "powerSource",
  "Router Installation Status": "routerStatus",
  "IP Address": "ipAddress",
  "Latitude": "latitude",
  "Longitude": "longitude",
  "On Air Date": "onAirDate",
  "Region": "region",
  "Rectifier Type": "rectifierType",
  "Tenants / Operators": "tenants",
  "REON Integration": "reonIntegration",
  "Rectifier Installed Capacity (3KW Module)": "rectifierCapacity",
  "Rectifier Max Capacity": "rectifierMaxCapacity",
  "Security Company": "securityCompany",
  "Site Type": "siteType",
  "Electronic Lock ID": "electronicLockId",
  "Field Engineer Name": "fieldEngineer",
  "Field Engineer Email Account": "fieldEngineerEmail",
  "Field Engineer Phone Contact": "fieldEngineerPhone",
  "2nd Field Engineer Name": "secondFieldEngineer",
  "2nd Field Engineer Email": "secondFieldEngineerEmail",
  "2nd Field Engineer Phone Contact": "secondFieldEngineerPhone",
  "APS / AMF Board": "apsAmfBoard",
  "Generator Type": "generatorType",
  "Generator Tank Capacity (L)": "generatorTankCapacity",
  "External Fuel Probe": "externalFuelProbe",
  "DC Meter Installation Date": "dcMeterInstallationDate",
  "DC Meter": "dcMeter",
  "Battery Type": "batteryType",
  "Battery Capacity": "batteryCapacity",
  "Priority": "priority",
  "No Of Solar Panel": "solarPanels",
  "Solar Capacity": "solarCapacity",
  "Solar Panel Brand": "solarPanelBrand",
  "No Of Solar Charge Controller (Tracer8420AN)": "solarChargeControllerTracer",
  "No Of Solar Charge Controller Flatpack2 48V Solar Charger or Megmeet Charge": "solarChargeControllerFlatpack",
  "Sactioned Load": "sanctionedLoad",
  "SLA": "sla",
  "Data Integrity": "dataIntegrity",
  "Software Cleanup": "softwareCleanup",
  "Comments": "comments",
};

const USERS_HEADER_MAP: Record<string, string> = {
  "No": "no",
  "User Name": "userName",
  "Email Address": "email",
  "Phone Number": "phone",
  "REON Onboarding": "reonOnboarding",
  "Group, Department and Region": "department",
  "Access Group and Region Email": "accessGroup",
  "Access Level": "accessLevel",
  "Region": "region",
  "Sites": "sites",
  "Roles and Scope": "roles",
};

const REVISION_HEADER_MAP: Record<string, string> = {
  "No": "no",
  "Scope": "scope",
  "Description": "description",
  "Revision Category": "revisionCategory",
  "Revision Date": "revisionDate",
};

/**
 * Transforms a row from Google Sheets (with descriptive headers) 
 * into an object with camelCase keys matching the app's type definitions.
 */
const mapHeaders = <T>(row: Record<string, string>, headerMap: Record<string, string>): T => {
  const mapped: Record<string, string> = {};
  const trimmedRow: Record<string, string> = {};
  for (const key of Object.keys(row)) {
    trimmedRow[key.trim()] = row[key];
  }
  for (const [sheetHeader, appKey] of Object.entries(headerMap)) {
    let value = (trimmedRow[sheetHeader] ?? "").trim();
    // Normalize IDs and priority numbers by removing .0 suffix
    if (appKey === "no" || appKey === "priority") {
      value = value.replace(".0", "");
    }
    mapped[appKey] = value;
  }
  return mapped as T;
};

/**
 * Transforms an app's camelCase object back into a Record with Sheet Headers.
 */
const unmapHeaders = (data: Partial<Site>, headerMap: Record<string, string>): Record<string, string> => {
  const reverseMap = Object.entries(headerMap).reduce((acc, [sheetHeader, appKey]) => {
    acc[appKey] = sheetHeader;
    return acc;
  }, {} as Record<string, string>);

  const unmapped: Record<string, string> = {};
  for (const [appKey, value] of Object.entries(data)) {
    const sheetHeader = reverseMap[appKey];
    if (sheetHeader) {
      unmapped[sheetHeader] = String(value ?? "");
    }
  }
  return unmapped;
};



export const fetchSheetData = async <T>(url: string, headerMap?: Record<string, string>): Promise<T[]> => {
  try {
    const response = await fetch(url);
    const csvData = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (headerMap) {
            const mapped = (results.data as Record<string, string>[]).map(
              (row) => mapHeaders<T>(row, headerMap)
            );
            resolve(mapped);
          } else {
            resolve(results.data as T[]);
          }
        },
        error: (error: Error) => reject(error),
      });
    });
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error);
    throw error;
  }
};

/**
 * Updates a site in the Google Sheet using a web app proxy (Apps Script).
 */
export const updateSite = async (siteNo: string, data: Partial<Site>) => {
  const APPS_SCRIPT_URL = localStorage.getItem("google_apps_script_url") || import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
  
  if (!APPS_SCRIPT_URL) {
    console.warn("Cloud Sync disabled: google_apps_script_url not found in localStorage or environment variables.");
    return;
  }

  const unmappedData = unmapHeaders(data, SITES_HEADER_MAP);
  
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain", // Use text/plain for no-cors compatibility
      },
      body: JSON.stringify({
        action: "update",
        sheetName: "Sites",
        idKey: "No",
        idValue: siteNo,
        data: unmappedData
      }),
    });
    
    return response;
  } catch (error) {
    console.error("Error updating Google Sheet:", error);
    throw error;
  }
};

/**
 * Updates a user in the Google Sheet.
 */
export const updateUser = async (userNo: string, data: Partial<User>) => {
  const APPS_SCRIPT_URL = localStorage.getItem("google_apps_script_url");
  if (!APPS_SCRIPT_URL) return;

  const reverseMap = Object.entries(USERS_HEADER_MAP).reduce((acc, [sheetHeader, appKey]) => {
    acc[appKey] = sheetHeader;
    return acc;
  }, {} as Record<string, string>);

  const unmappedData: Record<string, string> = {};
  for (const [appKey, value] of Object.entries(data)) {
    const sheetHeader = reverseMap[appKey];
    if (sheetHeader) unmappedData[sheetHeader] = String(value ?? "");
  }

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        sheetName: "Users",
        idKey: "No",
        idValue: userNo,
        data: unmappedData
      }),
    });
  } catch (error) {
    console.error("Error updating User in Google Sheet:", error);
    throw error;
  }
};

export const getSites = () => fetchSheetData<Site>(SITES_SHEET_URL, SITES_HEADER_MAP);
export const getUsers = async () => {
  const users = await fetchSheetData<User>(USERS_SHEET_URL, USERS_HEADER_MAP);
  // Return all users that have at least a name or numeric ID to see what data is coming through
  return users.filter(u => u.no || u.userName);
};

export const getEscalations = async (): Promise<EscalationEntry[]> => {
  try {
    const response = await fetch(ESCALATIONS_SHEET_URL);
    const csvData = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as string[][];
          const dataRows = rows.slice(3);
          const entries: EscalationEntry[] = dataRows
            .filter(row => row[0] && /^\d+$/.test(row[0].trim()))
            .map(row => ({
              no: (row[0] || "").trim(),
              alarm: (row[1] || "").trim() || "N/A",
              event: (row[2] || "").trim(),
              issueType: (row[3] || "").trim(),
              level1: (row[4] || "").trim(),
              level2: (row[5] || "").trim() || "N/A",
              level3: (row[6] || "").trim() || "N/A",
              method: (row[7] || "").trim(),
              notificationTime: (row[8] || "").trim(),
              designator: (row[9] || "").trim(),
              approvalL1: (row[11] || "").trim(),
              approvalL2: (row[12] || "").trim(),
              approvalL3: (row[13] || "").trim(),
              scopeDesignee: (row[14] || "").trim(),
              reviewerL1: (row[17] || "").trim(),
              reviewerL2: (row[16] || "").trim(),
              reviewerL3: (row[15] || "").trim(),
            }));
          resolve(entries);
        },
        error: (error: Error) => reject(error),
      });
    });
  } catch (error) {
    console.error("Error fetching Escalation data:", error);
    throw error;
  }
};

export const getPMChecklist = async (): Promise<ChecklistTask[]> => {
  try {
    const response = await fetch(PM_CHECKLIST_URL);
    const csvData = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as string[][];
          const entries: ChecklistTask[] = [];
          let currentSection = "";
          for (const row of rows) {
            const firstCol = (row[0] || "").trim();
            const secondCol = (row[1] || "").trim();
            if (firstCol.startsWith("Section")) {
              currentSection = secondCol || firstCol;
              continue;
            }
            if (firstCol === "Sr #" || !/^\d+$/.test(firstCol)) continue;
            entries.push({
              no: firstCol,
              section: currentSection,
              field: (row[1] || "").trim(),
              inputType: (row[2] || "").trim(),
              options: (row[3] || "").trim(),
              format: (row[4] || "").trim(),
              restrictions: (row[5] || "").trim(),
              pictureRequired: (row[6] || "").trim(),
              snagCategory: (row[7] || "").trim(),
              priority: (row[8] || "").trim(),
            });
          }
          resolve(entries);
        },
        error: (error: Error) => reject(error),
      });
    });
  } catch (error) {
    console.error("Error fetching PM Checklist data:", error);
    throw error;
  }
};

export const getRevisionSummary = async (): Promise<RevisionSummary[]> => {
  try {
    const response = await fetch(REVISION_SUMMARY_URL);
    const csvData = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as string[][];
          // Skip leading empty row and header row if they exist
          const dataRows = rows.filter(row => row[0] && /^\d+$/.test(row[0].trim()));
          const entries: RevisionSummary[] = dataRows.map(row => ({
            no: (row[0] || "").trim(),
            scope: (row[1] || "").trim(),
            description: (row[2] || "").trim(),
            revisionCategory: (row[3] || "").trim(),
            revisionDate: (row[4] || "").trim(),
          }));
          resolve(entries);
        },
        error: (error: Error) => reject(error),
      });
    });
  } catch (error) {
    console.error("Error fetching Revision Summary data:", error);
    throw error;
  }
};
