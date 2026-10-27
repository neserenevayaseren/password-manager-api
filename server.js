const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

const JWT_SECRET = 'super_secret_key_lab7';

const MONGO_URI = 'mongodb+srv://dashakravchenya41_db_user:D%40sha28.02.12Pro@cluster0.66zz9hk.mongodb.net/password-manager?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ База данных MongoDB подключена'))
  .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err.message));

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }
});
const User = mongoose.model('User', UserSchema);

const PasswordSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: String,
  login: String,
  password: String,
  createdAt: { type: Date, default: Date.now }
});
const Password = mongoose.model('Password', PasswordSchema);

const MessageSchema = new mongoose.Schema({
  room: String,
  senderId: String,
  senderName: String,
  text: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

async function createDefaultAdmin() {
  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', password: hashedPassword, role: 'admin' });
    console.log('👑 Создан аккаунт администратора (admin / admin123)');
  }
}
createDefaultAdmin();

let onlineUsers = {}; 

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Неверный токен' });
    req.user = user;
    next();
  });
};

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Пользователь уже существует' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword, role: 'user' });
    
    const token = jwt.sign({ id: newUser._id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: newUser._id, username: newUser.username, role: newUser.role } });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Неверный логин или пароль' });

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/passwords', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const offset = parseInt(req.query.offset) || 0;
    const search = (req.query.search || '');

    let query = { userId: req.user.id };
    if (search) {
      query.$or = [
        { title: { $regex: '^' + search, $options: 'i' } },
        { login: { $regex: '^' + search, $options: 'i' } }
      ];
    }

    const total = await Password.countDocuments(query);
    const items = await Password.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();
    
    const mappedItems = items.map(item => ({ ...item, id: item._id.toString() }));
    res.json({ items: mappedItems, total, hasMore: offset + limit < total });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка БД' });
  }
});

app.post('/api/passwords', authenticateToken, async (req, res) => {
  try {
    const newItem = await Password.create({ ...req.body, userId: req.user.id });
    const plainItem = newItem.toObject(); 
    plainItem.id = newItem._id.toString();

    io.to(`user_${req.user.id}`).emit('vault:updated', { action: 'created', item: plainItem });
    res.status(201).json(plainItem);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при сохранении' });
  }
});

app.put('/api/passwords/:id', authenticateToken, async (req, res) => {
  try {
    const updatedItem = await Password.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, req.body, { new: true }
    ).lean();
    
    if (!updatedItem) return res.status(404).json({ error: 'Не найдено' });
    
    const mapped = { ...updatedItem, id: updatedItem._id.toString() };
    io.to(`user_${req.user.id}`).emit('vault:updated', { action: 'updated', item: mapped });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления' });
  }
});

app.delete('/api/passwords/:id', authenticateToken, async (req, res) => {
  try {
    await Password.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    io.to(`user_${req.user.id}`).emit('vault:updated', { action: 'deleted', id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Нет токена'));

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Неверный токен'));
    socket.user = decoded; 
    next();
  });
});

io.on('connection', async (socket) => {
  const user = socket.user;
  console.log(`[Socket] Подключился: ${user.username} (${user.role})`);

  socket.join(`user_${user.id}`);

  if (user.role === 'admin') {
    socket.join('admin_room'); 

    try {
      const unreadMessages = await Message.find({ senderId: { $ne: user.id }, isRead: false }).lean();
      const unreadCounts = {};
      unreadMessages.forEach(msg => {
        const uId = msg.room.replace('user_', '');
        unreadCounts[uId] = (unreadCounts[uId] || 0) + 1;
      });
      if (Object.keys(unreadCounts).length > 0) {
        socket.emit('admin:unread_counts', unreadCounts);
      }
    } catch (err) {
      console.error('Ошибка подсчета непрочитанных для админа:', err);
    }
  } else {
    onlineUsers[user.id] = { id: user.id, username: user.username, socketId: socket.id };
    io.to('admin_room').emit('admin:users_list', Object.values(onlineUsers));

    try {
      const unreadCount = await Message.countDocuments({
        room: `user_${user.id}`, senderId: { $ne: user.id }, isRead: false 
      });
      if (unreadCount > 0) socket.emit('chat:unread_count', unreadCount);
    } catch (err) {
      console.error('Ошибка подсчета непрочитанных:', err);
    }
  }

  socket.on('admin:get_chats', async () => {
    if (user.role !== 'admin') return;
    try {
      const rooms = await Message.distinct('room');
      const userIds = rooms.map(r => r.replace('user_', '')).filter(id => mongoose.Types.ObjectId.isValid(id));
      const dbUsers = await User.find({ _id: { $in: userIds } }).select('username _id');
      const chats = dbUsers.map(u => ({ id: u._id.toString(), username: u.username }));
      socket.emit('admin:chats_list', chats);
    } catch (err) {
      console.error('Ошибка получения списка чатов:', err);
    }
  });

  socket.on('admin:get_users', () => {
    if (user.role === 'admin') socket.emit('admin:users_list', Object.values(onlineUsers));
  });

  socket.on('chat:join', async ({ toUserId }) => {
    const room = `user_${toUserId}`;
    if (user.role === 'admin') socket.join(room);
    try {
      const history = await Message.find({ room }).sort({ createdAt: 1 }).limit(50).lean();
      const mappedHistory = history.map(m => ({ ...m, id: m._id.toString(), time: new Date(m.createdAt).toLocaleTimeString() }));
      socket.emit('chat:history', mappedHistory);
    } catch (err) {
      console.error('Ошибка загрузки истории', err);
    }
  });

  socket.on('chat:mark_read', async ({ toUserId }) => {
    try {
      await Message.updateMany(
        { room: `user_${toUserId}`, senderId: { $ne: user.id }, isRead: false },
        { isRead: true }
      );
    } catch (err) {
      console.error('Ошибка отметки прочтения:', err);
    }
  });

  socket.on('chat:message', async ({ toUserId, text }) => {
    const room = `user_${toUserId}`;
    try {
      const newMsg = await Message.create({
        room, senderId: user.id, senderName: user.username, text
      });
      
      const msgData = {
        id: newMsg._id.toString(), senderId: user.id, senderName: user.username, text: newMsg.text, time: new Date(newMsg.createdAt).toLocaleTimeString()
      };

      io.to(room).emit('chat:message', msgData);
      io.to('admin_room').emit('admin:new_message', { ...msgData, toUserId });
    } catch (err) {
      console.error('Ошибка сохранения сообщения', err);
    }
  });

  socket.on('chat:typing', ({ toUserId, isTyping }) => {
    const room = `user_${toUserId}`;
    socket.to(room).emit('chat:typing', { username: user.username, isTyping });
  });

  socket.on('disconnect', () => {
    if (user.role === 'user') {
      delete onlineUsers[user.id];
      io.to('admin_room').emit('admin:users_list', Object.values(onlineUsers));
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Сервер запущен на http://localhost:${PORT}`));