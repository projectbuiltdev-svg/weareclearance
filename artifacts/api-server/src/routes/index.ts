import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import storageRouter from "./storage";
import settingsRouter from "./settings";
import cataloguePublishRouter from "./cataloguePublish";
import adminAccessRouter from "./adminAccess";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(settingsRouter);
router.use(cataloguePublishRouter);
router.use(adminAccessRouter);
router.use(productsRouter);

export default router;
