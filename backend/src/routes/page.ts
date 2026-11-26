import { Router } from "express";
import { confirmUserProfile, getUser } from "../controller/auth.ts";
import { authenticate } from "../packages/middleware/page.ts";
import { getAnimals, registerAnimal } from "../controller/animals.ts";

const router = Router();

router.post("/confirm-profile", authenticate, confirmUserProfile);
router.get("/get-profile", authenticate, getUser);
router.post("/reg-animal", authenticate, registerAnimal);
router.get("/get-animals", authenticate, getAnimals);
export default router;