export const users = [
  { id: 'admin', password: 'admin123' },
  { id: 'user1', password: 'pass123' },
  { id: 'user2', password: 'mypass' }
];

export const validateUser = (id, password) => {
  return users.find(user => user.id === id && user.password === password);
};

export const registerUser = (id, password) => {
  if (users.find(user => user.id === id)) {
    return { success: false, message: 'User already exists' };
  }
  users.push({ id, password });
  return { success: true, message: 'User registered successfully' };
};