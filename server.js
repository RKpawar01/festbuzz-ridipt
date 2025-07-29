const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db.js");
const AdminauthRoutes = require('./routes/AdminauthRoutes.js');
const authRoutes = require('./routes/Organization Routes/authRoutes.js')
const userRoutes = require('./routes/Organization Routes/userRoutes.js')
const festRoutes = require('./routes/FestRoutes/festRoutes.js');
const festTicketRoutes = require('./routes/FestRoutes/festTicketRoutes.js');
const participantRoutes = require('./routes/ParticipantRoutes/participantRoutes.js')
const eventRoutes = require('./routes/EventsRoutes/eventRoutes.js')
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB(); // uses your separate DB file

app.use(express.json());
app.use(cors());

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to FestBuzz');
});

app.use('/superadmin/api/auth', AdminauthRoutes);
app.use('/admin/api/auth', authRoutes)
app.use('/user/api/', userRoutes)
app.use('/api/fest', festRoutes);
app.use('/api/festticket', festTicketRoutes);
app.use('/api/event', eventRoutes)
//Participants Routes
app.use('/api/participant', participantRoutes)


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
