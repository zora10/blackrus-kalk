import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, TextField, Button, Typography, Paper, Grid, List, ListItem, ListItemText, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import theme from './theme';

const API_URL = 'https://blackrussia-kalkul.ru/api'; // Замените на ваш IP сервера

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', buyPrice: '' });
  const [sellPrice, setSellPrice] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [stats, setStats] = useState({ total_income: 0, total_expenses: 0, total_profit: 0 });
  const [telegramId, setTelegramId] = useState('');
  const [isIdSubmitted, setIsIdSubmitted] = useState(false);
  const [originalItems, setOriginalItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  // Для фильтрации по дате
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe;
      if (user && user.user) {
        setTelegramId(user.user.id.toString()); // Получаем ID из данных Telegram WebApp
        setIsIdSubmitted(true); // Пропускаем ввод ID, так как он уже получен
      }
    }
  }, []);

  useEffect(() => {
    if (isIdSubmitted) {
      loadItems();
      loadStats();
    }
  }, [isIdSubmitted]);

  const loadItems = async () => {
    try {
      const response = await fetch(`${API_URL}/items/${telegramId}`);
      const data = await response.json();
      setOriginalItems(data); // Сохраняем все данные в originalItems
      setFilteredItems(data); // Изначально показываем все данные
    } catch (error) {
      console.error('Error loading items:', error);
      alert('Ошибка при загрузке данных');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats/${telegramId}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId,
          name: newItem.name,
          buyPrice: Number(newItem.buyPrice)
        }),
      });

      if (response.ok) {
        setNewItem({ name: '', buyPrice: '' });
        loadItems();
        loadStats();
        
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Ошибка при добавлении товара');
    }
  };

  const handleSellItem = async () => {
    if (!selectedItem || !sellPrice) return;

    try {
      const response = await fetch(`${API_URL}/items/${selectedItem.id}/sell`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellPrice: Number(sellPrice)
        }),
      });

      if (response.ok) {
        setSellPrice('');
        setSelectedItem(null);
        loadItems();
        loadStats();
        
      }
    } catch (error) {
      console.error('Error selling item:', error);
      alert('Ошибка при регистрации продажи');
    }
  };

  const handleApplyDateFilter = () => {
    const filteredItems = items.filter(item => {
      // Преобразуем дату товара
      const itemDate = new Date(item.created_at)// Убираем время, оставляем только дату
  
      // Преобразуем дату начала фильтра (если задана)
      const start = startDate ? new Date(startDate)// Начало фильтра, без времени
  
      // Преобразуем дату конца фильтра (если задана)
      const end = endDate ? new Date(endDate)// Конец фильтра, до конца дня
  
      console.log("Item Date: ", new Date(item.created_at));
      console.log("Start Date: ", startDate, "End Date: ", endDate);
      console.log("Item Date Comparison:", itemDate, start, end);
  
      return (
        (!start || itemDate >= start) &&
        (!end || itemDate <= end)
      );
    });
  
    setItems(filteredItems); // Обновляем список товаров с фильтром
  };


  // Фильтрация элементов по дате
  const handleApplyDateFilter = () => {
    const filtered = originalItems.filter(item => {
      const itemDate = new Date(item.created_at); // Предположим, что это дата в строковом формате
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
  
      console.log(itemDate, start, end, start <= itemDate, itemDate <= end);
      
      return (
        (!start || itemDate >= start) &&
        (!end || itemDate <= end)
      );
    });
  
    setFilteredItems(filtered); // Обновляем отфильтрованные данные
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ pb: 4 }}>
        <Box sx={{ mt: 2, mb: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ color: '#ffffff' }}>
            ПЕРЕКУПЕР
          </Typography>

          <Grid container spacing={2}>
            {/* Формы добавления и продажи товара рядом */}
            <Grid item xs={6}>
              <Paper sx={{ p: 2, bgcolor: '#121212', border: '1px solid #121212' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                  Купить товар
                </Typography>
                <TextField
                  fullWidth
                  label="Название товара"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  margin="normal"
                  sx={{ input: { color: '#ffffff' } }}
                />
                <TextField
                  fullWidth
                  label="Цена покупки"
                  type="number"
                  value={newItem.buyPrice}
                  onChange={(e) => setNewItem({ ...newItem, buyPrice: e.target.value })}
                  margin="normal"
                  sx={{ input: { color: '#ffffff' } }}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleAddItem}
                  disabled={!newItem.name || !newItem.buyPrice}
                  sx={{ mt: 2, color: '#ffffff', borderColor: '#121212' }}
                >
                  Купить товар
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={6}>
              <Paper sx={{ p: 2, bgcolor: '#121212', border: '2px solid #121212' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                  Продать товар
                </Typography>
                <TextField
                  fullWidth
                  select
                  label="Выберите товар"
                  value={selectedItem ? selectedItem.id : ''}
                  onChange={(e) => setSelectedItem(items.find(item => item.id === Number(e.target.value)))}
                  margin="normal"
                  SelectProps={{
                    native: true,
                  }}
                  sx={{ select: { color: '#ffffff' } }}
                >
                  <option value="">Выберите товар</option>
                  {items.filter(item => !item.sell_price).map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Сумма продажи"
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  margin="normal"
                  sx={{ input: { color: '#ffffff' } }}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleSellItem}
                  disabled={!selectedItem || !sellPrice}
                  sx={{ mt: 2, color: '#ffffff', borderColor: '#121212' }}
                >
                  Продать товар
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* Статистика */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#121212', border: '1px solid #121212' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                Статистика
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography sx={{ color: '#ffffff' }}>
                    Доход: ₽ {stats.total_income || 0}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ color: '#ffffff' }}>
                    Расходы: ₽ {stats.total_expenses || 0}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ color: '#ffffff' }}>
                    Прибыль: ₽ {stats.total_profit || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Фильтрация по дате */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#121212', border: '1px solid #121212' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                Фильтр по дате
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Дата от"
                    type="date"
                    InputLabelProps={{ shrink: true, style: { color: '#ffffff' } }}
                    InputProps={{ style: { color: '#ffffff' } }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Дата до"
                    type="date"
                    InputLabelProps={{ shrink: true, style: { color: '#ffffff' } }}
                    InputProps={{ style: { color: '#ffffff' } }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 1, color: '#ffffff', borderColor: '#ffffff' }}
                    onClick={handleApplyDateFilter}
                  >
                    Применить фильтр
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* История операций */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#121212', border: '1px solid #121212' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                История операций
              </Typography>
              <List sx={{ padding: 0 }}>
                {items.map((item) => (
                  <ListItem key={item.id} sx={{ padding: '0', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <ListItemText
                      secondary={`${item.name} Куплено: ₽${item.buy_price}${item.sell_price ? ` | Продано: ₽${item.sell_price} | Прибыль: ₽${(item.sell_price - item.buy_price).toFixed(2)}` : ''}`}
                      sx={{
                        '& .MuiListItemText-primary': { color: '#ffffff' },
                        '& .MuiListItemText-secondary': { color: '#ffffff' }
                      }}
                    />
                    <IconButton
                      onClick={() => handleDeleteItem(item.id)}
                      sx={{
                        bgcolor: 'red', color: 'white', width: '22px', height: '22px',
                        '&:hover': { bgcolor: 'darkred' }
                      }}
                    >
                      <CloseIcon sx={{ fontSize: '16px' }} />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
