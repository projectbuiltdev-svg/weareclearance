import { getAuth } from "@clerk/express";
import { RequestUploadUrlBody, RequestUploadUrlResponse } from "@workspace/api-zod";
import { Router, type IRouter } from "express";
import { createProductImageUpload, getProductImage, streamProductImage } from "../lib/productStorage";
import { requireAdmin } from "../middlewares/adminAuth";

const router: IRouter = Router();

router.post("/storage/uploads/request-url", requireAdmin, async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Use a JPEG, PNG, or WebP image up to 10MB" });
    return;
  }
  try {
    const { uploadURL, objectPath } = await createProductImageUpload();
    res.json(RequestUploadUrlResponse.parse({
      uploadURL,
      objectPath,
      imageUrl: `/api/storage${objectPath}`,
      uploadedBy: auth.userId,
    }));
  } catch (error) {
    req.log.error({ err: error }, "Could not create product image upload");
    res.status(500).json({ error: "Could not prepare image upload" });
  }
});

router.get("/storage/objects/*path", async (req, res): Promise<void> => {
  const raw = req.params.path;
  const path = Array.isArray(raw) ? raw.join("/") : raw;
  try {
    const file = await getProductImage(`/objects/${path}`);
    if (!file) {
      res.status(404).json({ error: "Image not found" });
      return;
    }
    await streamProductImage(file, res);
  } catch (error) {
    req.log.error({ err: error }, "Could not serve product image");
    res.status(500).json({ error: "Could not serve image" });
  }
});

export default router;