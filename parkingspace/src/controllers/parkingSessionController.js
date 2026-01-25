import sequelize from "../config/db.js";
import {
  parkingSpace,
  parkingSession,
  payment as PaymentModel,
} from "../models/index.js";

/**
 * 🚗 START PARKING SESSION
 */
export const startParkingSession = async (req, res) => {
  const { parking_id } = req.body;
  const userId = req.user.id;

  try {
    const session = await sequelize.transaction(async (t) => {
      // 1️⃣ Check if user already has active session
      const activeSession = await parkingSession.findOne({
        where: { user_id: userId, end_time: null },
        transaction: t,
      });

      if (activeSession) {
        throw new Error("User already has an active parking session");
      }

      // 2️⃣ Get parking
      const parking = await parkingSpace.findByPk(parking_id, {
        transaction: t,
      });

      if (!parking || !parking.is_active) {
        throw new Error("Parking not available");
      }

      // 3️⃣ Occupy spot (MODEL LOGIC)
      await parking.occupySpot(t);

      // 4️⃣ Create session
      return await parkingSession.create(
        {
          user_id: userId,
          parking_id,
        },
        { transaction: t }
      );
    });

    res.status(201).json({
      message: "Parking session started",
      session,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * 🏁 END PARKING SESSION
 */
export const endParkingSession = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await sequelize.transaction(async (t) => {
      // 1️⃣ Find active session
      const session = await parkingSession.findOne({
        where: { user_id: userId, end_time: null },
        transaction: t,
      });

      if (!session) {
        throw new Error("No active parking session found");
      }

      // 2️⃣ Get parking
      const parking = await parkingSpace.findByPk(session.parking_id, {
        transaction: t,
      });

      // 3️⃣ End session
      const endTime = new Date();
      session.end_time = endTime;
      await session.save({ transaction: t });

      // 4️⃣ Calculate duration (hours, minimum 1)
      const durationMs = endTime - session.start_time;
      const hours = Math.max(
        1,
        Math.ceil(durationMs / (1000 * 60 * 60))
      );

      // 5️⃣ Calculate amount
      const amount = hours * parking.price_per_hour;

      // 6️⃣ Release spot (MODEL LOGIC)
      await parking.releaseSpot(t);

      // 7️⃣ Create & complete payment (MODEL LOGIC)
      const paymentRecord = await PaymentModel.createCompletedPayment(
        {
          session_id: session.id,
          amount,
          payment_method: "wallet",
        },
        t
      );

      return { hours, paymentRecord };
    });

    res.json({
      message: "Parking session ended",
      duration_hours: result.hours,
      payment: result.paymentRecord,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
