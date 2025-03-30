import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close'; // Импортируем CloseIcon

import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, TextField, Button, Typography, List, ListItem, ListItemText, Paper, Grid, IconButton } from '@mui/material';
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

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    const userId = tg.initDataUnsafe.user.id;
    setTelegramId(userId); // Устанавливаем ID пользователя из Telegram WebApp
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
      setItems(data);
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
        alert('Товар успешно добавлен');
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
        alert('Продажа успешно зарегистрирована');
      }
    } catch (error) {
      console.error('Error selling item:', error);
      alert('Ошибка при регистрации продажи');
    }
  };

  const handleSubmitId = (e) => {
    e.preventDefault();
    if (telegramId.trim()) {
      setIsIdSubmitted(true);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }
  
      const data = await response.json();
      console.log('Item deleted:', data);
      setItems((prevItems) => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error.message);
    }
  };

  if (!isIdSubmitted) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm">
          <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5" gutterBottom sx={{ color: '#ffffff' }}>
              Калькулятор перепродаж
            </Typography>
            <Typography variant="body1" sx={{ color: '#ffffff', mb: 2 }}>
              Ваш Telegram ID: {telegramId} {/* Выводим ID прямо на странице */}
            </Typography>
            <Box component="form" onSubmit={handleSubmitId} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Ваш Telegram ID"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                autoFocus
                sx={{ input: { color: '#ffffff' } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="outlined"
                sx={{ mt: 3, mb: 2, color: '#ffffff', borderColor: '#121212' }}
              >
                Начать работу
              </Button>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ pb: 4 }}>
        <Box sx={{ mt: 2, mb: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ color: '#ffffff' }}>
            Калькулятор перепродаж
          </Typography>
          <Typography variant="body1" sx={{ color: '#ffffff', mb: 2 }}>
            Ваш Telegram ID: {telegramId} {/* Выводим ID на всех страницах */}
          </Typography>

          <Grid container spacing={2}>
            {/* Ваш остальной код */}
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
