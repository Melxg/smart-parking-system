import { Op, literal } from "sequelize";
import { parkingSpace, parkingLocation, parkingImage } from "../models/index.js";

export const createParking = async (req, res) => {
  try {
    const {
      name,
      description,
      total_spots,
      price_per_hour,
      latitude,
      longitude,
      address,
      city,
    } = req.body;

    if (!name || !total_spots || !price_per_hour || !latitude || !longitude) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parking = await parkingSpace.create({
      owner_id: req.user.id, // still track ownership
      name,
      description,
      total_spots,
      available_spots: total_spots,
      price_per_hour,
    });

    await parkingLocation.create({
      parking_id: parking.id,
      latitude,
      longitude,
      address,
      city,
    });

    res.status(201).json({
      message: "Parking spot registered successfully",
      parking_id: parking.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to register parking spot" });
  }
};



export const searchParking = async (req, res) => {
  try {
    const { lat, lng, radius = 3 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    // Haversine formula (distance in KM)
    const distanceFormula = `
      (6371 * acos(
        cos(radians(${lat})) *
        cos(radians(latitude)) *
        cos(radians(longitude) - radians(${lng})) +
        sin(radians(${lat})) *
        sin(radians(latitude))
      ))
    `;

    const parkings = await parkingSpace.findAll({
      where: {
        is_active: true,
        available_spots: { [Op.gt]: 0 },
      },
      include: [
        {
          model: parkingLocation,
          attributes: ["latitude", "longitude", "address"],
          where: literal(`${distanceFormula} <= ${radius}`),
        },
      ],
    });

    res.json(parkings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed" });
  }
};



export const getMyParkings = async (req, res) => {
  try {
    const parkings = await parkingSpace.findAll({
      where: { owner_id: req.user.id },
      include: [
        {
          model: parkingLocation,
          attributes: ["latitude", "longitude", "address", "city"],
        },
        {
          model: parkingImage,
          attributes: ["image_url"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(parkings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch your parking spots" });
  }
};
