import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dishesRouter from "./dishes";
import eventsRouter from "./events";
import menusRouter from "./menus";
import costRouter from "./cost";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/dishes", dishesRouter);
router.use("/events", eventsRouter);
router.use("/events/:id/menu", menusRouter);
router.use("/events/:id/cost", costRouter);
router.use("/dashboard", dashboardRouter);

export default router;
