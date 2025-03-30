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
    // Получаем ID пользователя из Telegram WebApp API
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe; // Получаем unsafe data, если включен доступ
      const userId = user.user.id; // Извлекаем ID пользователя
      setTelegramId(userId); // Сохраняем ID в состояние
      setIsIdSubmitted(true); // Устанавливаем флаг, что ID получен
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

  const handleDeleteItem = async (id) => {
    try {
      // Отправляем DELETE-запрос на сервер с нужным id
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',  // Указываем метод запроса DELETE
        headers: {
          'Content-Type': 'application/json',  // Устанавливаем тип контента
        },
      });
  
      if (!response.ok) {
        // Если запрос завершился с ошибкой, выбрасываем ошибку
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }
  
      const data = await response.json();  // Получаем ответ от сервера
      console.log('Item deleted:', data);
  
      // Обновляем состояние items, удалив элемент по id
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
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ pb: 4 }}>
        {/* Ваш контент приложения */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#121212', border: '1px solid #121212' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                Статистика
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography sx={{ color: '#ffffff' }}>
                    Доход: ${stats.total_income || 0}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ color: '#ffffff' }}>
                    Расходы: ${stats.total_expenses || 0}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography sx={{ color: '#ffffff' }}>
                    Прибыль: $ {stats.total_profit || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
