export const users = [
  { id: 'admin', password: 'admin123', role: 'admin' },
  { id: 'user1', password: 'pass123', role: 'user' },
  { id: 'user2', password: 'mypass', role: 'user' }
];

export const validateUser = (id, password) => {
  return users.find(user => user.id === id && user.password === password);
};

export const registerUser = (id, password) => {
  if (users.find(user => user.id === id)) {
    return { success: false, message: 'User already exists' };
  }
  users.push({ id, password, role: 'user' });
  return { success: true, message: 'User registered successfully' };
};

export const isAdmin = (userId) => {
  const user = users.find(u => u.id === userId);
  return user && user.role === 'admin';
};