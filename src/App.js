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
      // Отправляем DELETE-запрос на сервер с нужным id
      const response = await fetch(`/api/items/${id}`, {
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
      // Например, если у вас есть массив items в состоянии компонента, вы можете сделать так:
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

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: '#121212', border: '1px solid #121212' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, bgcolor: '#121212', border: '1px solid #121212' }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                          Добавить новый товар
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
                          Добавить товар
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
                  
                </Typography>
                
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#121212', border: '1px solid #121212' }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                      История транзакций
                    </Typography>
                    {/* Здесь будет таблица с историей транзакций */}
                  </Paper>
                </Grid>
              </Paper>
            </Grid>

            

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
                      InputLabelProps={{
                        shrink: true,
                        style: { color: '#ffffff' }
                      }}
                      InputProps={{
                        style: { color: '#ffffff' }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#ffffff',
                          },
                          '&:hover fieldset': {
                            borderColor: '#ffffff',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Дата до"
                      type="date"
                      InputLabelProps={{
                        shrink: true,
                        style: { color: '#ffffff' }
                      }}
                      InputProps={{
                        style: { color: '#ffffff' }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#ffffff',
                          },
                          '&:hover fieldset': {
                            borderColor: '#ffffff',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ mt: 1, color: '#ffffff', borderColor: '#ffffff' }}
                    >
                      Применить фильтр
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: '#121212', border: '1px solid #121212' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
                  Статистика
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: '#1e1e1e', textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        Всего инвестировано
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#ffffff' }}>
                        ₽{items.reduce((total, item) => total + parseFloat(item.buy_price || 0), 0).toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: '#1e1e1e', textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        Текущая стоимость
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#ffffff' }}>
                        ₽{items.reduce((total, item) => total + (item.sell_price ? parseFloat(item.sell_price) : parseFloat(item.buy_price || 0)), 0).toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: '#1e1e1e', textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        Прибыль/Убыток
                      </Typography>
                      {(() => {
                        const profit = items.reduce((total, item) => total + (item.sell_price ? parseFloat(item.sell_price) - parseFloat(item.buy_price || 0) : 0), 0);
                        return (
                          <Typography variant="h6" sx={{ color: profit >= 0 ? '#4caf50' : '#f44336' }}>
                            ₽{profit.toFixed(2)}
                          </Typography>
                        );
                      })()}
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: '#1e1e1e', textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        ROI
                      </Typography>
                      {(() => {
                        const invested = items.reduce((total, item) => total + parseFloat(item.buy_price || 0), 0);
                        const profit = items.reduce((total, item) => total + (item.sell_price ? parseFloat(item.sell_price) - parseFloat(item.buy_price || 0) : 0), 0);
                        const roi = invested > 0 ? (profit / invested) * 100 : 0;
                        return (
                          <Typography variant="h6" sx={{ color: roi >= 0 ? '#4caf50' : '#f44336' }}>
                            {roi.toFixed(2)}%
                          </Typography>
                        );
                      })()}
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#121212', border: '1px solid #121212' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>
              История операций
            </Typography>
            <List sx={{ padding: 0, display: 'flex', flexDirection: 'column' }}> 
                  {items.map((item) => (
                    <ListItem key={item.id}sx={{ padding: '0', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}> {/* Убираем отступы и добавляем margin для ступенчатого эффекта */}
                      <ListItemText
                        secondary={`${item.name} Куплено : $${item.buy_price}${item.sell_price ? ` | Продано : $${item.sell_price} | Прибыль : $${(item.sell_price - item.buy_price).toFixed(2)}` : ''}`}
                        sx={{
                          '& .MuiListItemText-primary': { color: '#ffffff' },
                          '& .MuiListItemText-secondary': { color: '#ffffff' }
                        }}
                      />
                      <IconButton
                        onClick={() => handleDeleteItem(item.id)}
                        sx={{
                          bgcolor: 'red', // Красный фон
                          color: 'white', // Белый цвет для иконки
                          width: '22px', // Уменьшаем ширину кнопки
                          height: '22px', // Уменьшаем высоту кнопки
                          borderRadius: '0', // Убираем округление
                          '&:hover': {
                            bgcolor: 'darkred', // Эффект при наведении
                          },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: '16px', color: 'white' }} /> {/* Уменьшаем размер иконки */}
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
