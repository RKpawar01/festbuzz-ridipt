const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db.js");
const AdminauthRoutes = require('./routes/AdminauthRoutes.js');
const authRoutes = require('./routes/Organization Routes/authRoutes.js')
const userRoutes = require('./routes/Organization Routes/userRoutes.js')
const analyticsRoutes = require('./routes/Organization Routes/analyticsRoutes.js')
const festRoutes = require('./routes/FestRoutes/festRoutes.js');
const festTicketRoutes = require('./routes/FestRoutes/festTicketRoutes.js');
const participantRoutes = require('./routes/ParticipantRoutes/participantRoutes.js')
const eventRoutes = require('./routes/EventsRoutes/eventRoutes.js')
const imageRoutes = require('./routes/s3bucket/ImageRoute.js');
const participantfestRoutes = require('./routes/ParticipantRoutes/participantfestRoutes.js')
const participanteventRoutes = require('./routes/ParticipantRoutes/participanteventRoutes.js')
const FestBookingRoutes = require('./routes/BookingRoutes/FestBookingRoutes.js')
const eventBookingRoutes =require('./routes/BookingRoutes/eventBookingRoutes.js')
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cors());

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to FestBuzz');
});

app.use('/superadmin/api/auth', AdminauthRoutes);
app.use('/admin/api/auth', authRoutes)
app.use('/user/api/', userRoutes)
app.use('/admin/api/analytics', analyticsRoutes)
app.use('/api/fest', festRoutes);
app.use('/api/festticket', festTicketRoutes);
app.use('/api/event', eventRoutes)

//Participants Routes
app.use('/api/participant', participantRoutes)

//Participant Fest Routes 
app.use('/api/participant/fest', participantfestRoutes)

//Participant event Routes
app.use('/api/participant/event', participanteventRoutes)

//Participnat Fest Booking
app.use('/api/fest/booking', FestBookingRoutes)

//Participant Event Booking
app.use('/api/event/booking',eventBookingRoutes)

//aws s3 bucket
app.use('/api/images', imageRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
