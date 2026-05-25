import express from "express";
import cors from "cors";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import { validateBody } from "./middleware/validator";

import siteRoutes from "./routes/siteRoutes";
import userRoutes from "./routes/userRoutes";
import escalationRoutes from "./routes/escalationRoutes";
import pmChecklistRoutes from "./routes/pmChecklistRoutes";
import revisionSummaryRoutes from "./routes/revisionSummaryRoutes";
import { createTableCrudRouter } from "./routes/tableCrudRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(validateBody);

app.use("/api/sites", siteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/escalations", escalationRoutes);
app.use("/api/pm-checklists", pmChecklistRoutes);
app.use("/api/fueling-checklists", createTableCrudRouter("fueling_checklists", "fueling checklists"));
app.use("/api/cm-checklists", createTableCrudRouter("cm_checklists", "CM checklists"));
app.use("/api/work-order-checklists", createTableCrudRouter("work_order_checklists", "work order checklists"));
app.use("/api/wo-approval-workflows", createTableCrudRouter("wo_approval_workflows", "WO approval workflows"));
app.use("/api/excel-sheet-rows", createTableCrudRouter("excel_sheet_rows", "Excel sheet rows", "id"));
app.use("/api/revision-summaries", revisionSummaryRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.json({
    message: "Backend API running successfully",
  });
});

app.use(errorHandler);

export default app;
