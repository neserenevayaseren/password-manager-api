const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let passwords = [
  { id: 1, title: 'Почта mail', login: 'kravchenya.dasha@bk.ru', password: 'jdg0!Kyc5M4#' },
  { id: 2, title: 'Telegram', login: 'neserenevayaseren', password: 'xns3jfDKMHIE' },
  { id: 3, title: 'YouTube', login: 'dasha', password: 'Q7RkIBIJKF@X' },
  { id: 4, title: 'Instagram', login: 'furia', password: '&oeuuDtBeJZM' },
  { id: 5, title: 'Почта google', login: 'kravchenya41.dasha@gmail.com', password: '99GnvHTO7zh@' },
  { id: 6, title: 'Instagram', login: 'chertik', password: 'TFJqeJAx5iCw' },
];

app.get('/api/passwords', (req, res) => {
  const limit = parseInt(req.query.limit) || 3;
  const offset = parseInt(req.query.offset) || 0;
  const search = (req.query.search || '').toLowerCase();

  let filtered = passwords.slice();
  if (search) {
    filtered = filtered.filter(item => 
      (item.title && item.title.toLowerCase().startsWith(search)) ||
      (item.login && item.login.toLowerCase().startsWith(search))
    );
  }

  const paginatedPasswords = filtered.slice(offset, offset + limit);

  res.json({
    items: paginatedPasswords,
    total: filtered.length,
    hasMore: offset + limit < filtered.length
  });
});


app.post('/api/passwords', (req, res) => {
  const newItem = { 
    id: Date.now(), 
    title: req.body.title, 
    login: req.body.login, 
    password: req.body.password,
    createdAt: Date.now() 
  };
  passwords.unshift(newItem);
  res.status(201).json(newItem);
});


app.put('/api/passwords/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = passwords.findIndex(item => item.id === id);
  
  if (index !== -1) {
    passwords[index] = { ...passwords[index], ...req.body };
    
    const [updatedItem] = passwords.splice(index, 1);
    passwords.unshift(updatedItem);

    res.json(updatedItem);
  } else {
    res.status(404).json({ error: 'Запись не найдена' });
  }
});

app.delete('/api/passwords/:id', (req, res) => {
  const id = Number(req.params.id);
  passwords = passwords.filter(item => item.id !== id);
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});