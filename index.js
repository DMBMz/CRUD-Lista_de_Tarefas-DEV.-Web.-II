const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

console.log('Iniciando o servidor...');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

let tarefas = [];
let idCounter = 1;

app.get('/tarefas', (req, res) => {
  console.log('GET /tarefas chamado');
  const { status } = req.query;
  
  if (status !== undefined) {
    const statusBool = status === 'true';
    const tarefasFiltradas = tarefas.filter(tarefa => tarefa.status === statusBool);
    return res.json(tarefasFiltradas);
  }

  res.json(tarefas);
});

app.post('/tarefas', (req, res) => {
  console.log('POST /tarefas chamado');
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'O nome da tarefa é obrigatório.' });
  }

  const tarefaExistente = tarefas.find(tarefa => tarefa.nome.toLowerCase() === nome.toLowerCase());
  if (tarefaExistente) {
    return res.status(400).json({ erro: 'Já existe uma tarefa com esse nome.' });
  }

  const novaTarefa = {
    id: idCounter++,
    nome,
    status: false
  };

  tarefas.push(novaTarefa);
  res.status(201).json(novaTarefa);
});

app.put('/tarefas/:id', (req, res) => {
  console.log(`PUT /tarefas/${req.params.id} chamado`);
  const { id } = req.params;
  const { nome, status } = req.body;

  const tarefaIndex = tarefas.findIndex(tarefa => tarefa.id === parseInt(id));

  if (tarefaIndex === -1) {
    return res.status(404).json({ erro: 'Tarefa não encontrada.' });
  }

  if (nome) {
    const tarefaExistente = tarefas.find(tarefa => tarefa.nome.toLowerCase() === nome.toLowerCase() && tarefa.id !== parseInt(id));
    if (tarefaExistente) {
      return res.status(400).json({ erro: 'Já existe uma tarefa com esse nome.' });
    }
    tarefas[tarefaIndex].nome = nome;
  }

  if (status !== undefined) {
    tarefas[tarefaIndex].status = status;
  }

  res.json(tarefas[tarefaIndex]);
});

app.delete('/tarefas/:id', (req, res) => {
  console.log(`DELETE /tarefas/${req.params.id} chamado`);
  const { id } = req.params;

  const tarefaIndex = tarefas.findIndex(tarefa => tarefa.id === parseInt(id));

  if (tarefaIndex === -1) {
    return res.status(404).json({ erro: 'Tarefa não encontrada.' });
  }

  const tarefaRemovida = tarefas.splice(tarefaIndex, 1);
  res.json({ mensagem: 'Tarefa removida com sucesso.', tarefa: tarefaRemovida[0] });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
