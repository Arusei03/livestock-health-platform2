import { Request, Response } from "express";
import prisma from "../packages/prisma/index.ts";
import { AuthenticationError, ValidationError } from "../packages/error-handler/error-middleware.ts";

export const registerAnimal = async (req: Request, res: Response) => {
  try {
    const {
      tagNumber,
      name,
      species,
      breed,
      sex,
      dateOfBirth,
      ageIsEstimated,
      imageKey,
      notes,
    } = req.body;

    console.log (req.body, "data")

        if (!req.user) {
        throw new AuthenticationError("Authentication required");
        }

        const owner = await prisma.user.findUnique({
        where: {
            cognitoId: req.user.sub,
        },
        select: {
            id: true,
        },
        });

        if (!owner) {
        throw new ValidationError("User profile not found");
        }

    if (!tagNumber || !species) {
      return res.status(400).json({
        message: "Tag number and species are required.",
      });
    }

    const animal = await prisma.animal.create({
      data: {
        tagNumber,
        name,
        species,
        breed,
        sex,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        ageIsEstimated: ageIsEstimated ?? false,
        imageKey,
        notes,
        ownerId: owner.id,
      },
    });

    return res.status(201).json({
      message: "Animal registered successfully.",
      animal,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "You already have an animal with this tag number.",
      });
    }

    console.error("Animal registration error:", error);

    return res.status(500).json({
      message: "Unable to register animal.",
    });
  }
};

export const getAnimals = async (req: Request, res: Response) => {
  try {
       if (!req.user) {
        throw new AuthenticationError("Authentication required");
        }
    const owner = await prisma.user.findUnique({
      where: {
        cognitoId: req.user.sub,
      },
      select: {
        id: true,
      },
    });

    if (!owner) {
      throw new ValidationError("User profile not found");
    }

    const animals = await prisma.animal.findMany({
      where: {
        ownerId: owner.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      animals,
    });
  } catch (error) {
    throw error;
  }
};