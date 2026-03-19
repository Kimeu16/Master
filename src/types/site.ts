export interface Site {
  no: string;
  siteName: string;
  powerSource: string;
  routerStatus: string;
  ipAddress: string;
  latitude: string;
  longitude: string;
  onAirDate: string;
  region: string;
  rectifierType: string;
  tenants: string;
  reonIntegration: string;
  rectifierCapacity: string;
  rectifierMaxCapacity: string;
  securityCompany: string;
  siteType: string;
  electronicLockId: string;
  fieldEngineer: string;
  fieldEngineerEmail: string;
  fieldEngineerPhone: string;
  secondFieldEngineer: string;
  secondFieldEngineerEmail: string;
  secondFieldEngineerPhone: string;
  apsAmfBoard: string;
  generatorType: string;
  generatorTankCapacity: string;
  externalFuelProbe: string;
  dcMeterInstallationDate: string;
  dcMeter: string;
  batteryType: string;
  batteryCapacity: string;
  priority: string;
  solarPanels: string;
  solarCapacity: string;
  solarPanelBrand: string;
  solarChargeControllerTracer: string;
  solarChargeControllerFlatpack: string;
  sanctionedLoad: string;
  sla: string;
  dataIntegrity: string;
  softwareCleanup: string;
  comments: string;
}

export interface User {
  no: string;
  userName: string;
  email: string;
  phone: string;
  reonOnboarding: string;
  department: string;
  accessGroup: string;
  accessLevel: string;
  region: string;
  sites: string;
  roles: string;
}

export interface EscalationEntry {
  no: string;
  alarm: string;
  event: string;
  issueType: string;
  level1: string;
  level2: string;
  level3: string;
  method: string;
  notificationTime: string;
  designator: string;
  approvalL1: string;
  approvalL2: string;
  approvalL3: string;
  scopeDesignee: string;
  reviewerL1: string;
  reviewerL2: string;
  reviewerL3: string;
}

export interface ChecklistTask {
  no: string;
  section: string;
  field: string;
  inputType: string;
  options: string;
  format: string;
  restrictions: string;
  pictureRequired: string;
  snagCategory: string;
  priority: string;
}

export interface RevisionSummary {
  no: string;
  scope: string;
  description: string;
  revisionCategory: string;
  revisionDate: string;
}


