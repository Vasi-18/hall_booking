const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://root:root@cluster0.hlmt15e.mongodb.net/hall_booking?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("database connected");
  })
  .catch(() => {
    console.log("err");
  });

//Middleware to parse JSON data in the request body
app.use(express.json());

let rooms = [];
let bookings = [];

app.get("/", (req, res) => {
  res.send("Welcome to the Hall-Booking API");
});

//1.Creating the Room
app.post("/rooms", (req, res) => {
  const { room_id, seats_available, amenities, price_per_hour } = req.body;
  const room = {
    room_id,
    seats_available,
    amenities,
    price_per_hour,
  };
  rooms.push(room);
  res
    .status(201)
    .json({ room_id: room.room_id, message: "Room created successfully" });
});

//2. Booking a Room
app.post("/bookings", (req, res) => {
  const { booking_id, customer_name, date, start_time, end_time, room_id } =
    req.body;
  console.log("Requested room_id:", room_id);
  const room = rooms.find((r) => r.room_id === String(room_id));
  console.log("Found room:", room);
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }
  const booking = {
    booking_id,
    customer_name,
    date,
    start_time,
    end_time,
    room_id,
  };
  bookings.push(booking);
  res.status(201).json({
    booking_id: booking.booking_id,
    message: "Room booked successfully",
  });
});

// 3. List all Rooms with Booked Data
app.get("/rooms/booked", (req, res) => {
  const roomsWithBookings = rooms.map((room) => {
    const bookedData = bookings.find(
      (booking) => booking.room_id === room.room_id
    );
    return {
      room_name: room.room_id,
      booked_status: !!bookedData,
      customer_name: bookedData?.customer_name || null,
      date: bookedData?.date || null,
      start_time: bookedData?.start_time || null,
      end_time: bookedData?.end_time || null,
    };
  });
  res.json({ rooms: roomsWithBookings });
});

// 4. List all Customers with Booked Data
app.get("/customers/booked", (req, res) => {
  const customersWithBookings = bookings.map((booking) => {
    const room = rooms.find((r) => r.room_id === booking.room_id);
    return {
      customer_name: booking.customer_name,
      room_name: room.room_id,
      date: booking.date,
      start_time: booking.start_time,
      end_time: booking.end_time,
    };
  });
  res.json({ customers: customersWithBookings });
});

// 5. List Booking Details for a Customer
app.get("/customers/:customer_name/bookings", (req, res) => {
  const { customer_name } = req.params;
  const customerBookings = bookings.filter(
    (booking) => booking.customer_name === customer_name
  );
  res.json({ bookings: customerBookings });
});

app.listen(PORT, (err) => {
  if (err) {
    console.log(`Error in Running the PORT:${PORT}`);
  } else {
    console.log(`PORT:${PORT} is Running`);
  }
});
