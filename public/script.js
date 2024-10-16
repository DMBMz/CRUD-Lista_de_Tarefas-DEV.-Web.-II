const listaTarefas = document.getElementById('listaTarefas');
const adicionarTarefaBtn = document.getElementById('adicionarTarefa');
const nomeTarefaInput = document.getElementById('nomeTarefa');
const filtroStatus = document.getElementsByName('status');

const modalEditar = document.getElementById('modalEditar');
const spanFecharEditar = modalEditar.querySelector('.close');
const editarNomeTarefa = document.getElementById('editarNomeTarefa');
const editarStatusTarefa = document.getElementById('editarStatusTarefa');
const salvarEdicaoBtn = document.getElementById('salvarEdicao');
let tarefaIdEditando = null;

const modalExcluir = document.getElementById('modalExcluir');
const spanFecharExcluir = modalExcluir.querySelector('.close');
const btnCancelarExcluir = modalExcluir.querySelector('.btn-cancelar');
const btnConfirmarExcluir = modalExcluir.querySelector('.btn-confirmar');
let tarefaIdExcluindo = null;

function mostrarMensagem(texto, tipo = 'sucesso') {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.textContent = texto;
    mensagemDiv.className = `mensagem mensagem-${tipo}`;
    mensagemDiv.style.display = 'block';
    setTimeout(() => {
        mensagemDiv.style.display = 'none';
    }, 3000);
}

function buscarTarefas(status = 'all') {
    let url = '/tarefas';
    if (status !== 'all') {
        url += `?status=${status}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            listarTarefas(data);
        })
        .catch(error => console.error('Erro:', error));
}

function listarTarefas(tarefas) {
    listaTarefas.innerHTML = '';
    tarefas.forEach(tarefa => {
        const li = document.createElement('li');
        li.textContent = `${tarefa.nome} - ${tarefa.status ? 'Concluída' : 'Incompleta'}`;

        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.classList.add('btn-editar');
        btnEditar.onclick = () => abrirModalEditar(tarefa);

        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.classList.add('btn-excluir');
        btnExcluir.onclick = () => abrirModalExcluir(tarefa.id);

        li.appendChild(btnEditar);
        li.appendChild(btnExcluir);
        listaTarefas.appendChild(li);
    });
}

function adicionarTarefa() {
    const nome = nomeTarefaInput.value.trim();
    if (nome === '') {
        mostrarMensagem('Por favor, insira o nome da tarefa.', 'erro');
        return;
    }

    fetch('/tarefas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
    })
    .then(response => response.json())
    .then(data => {
        if (data.erro) {
            mostrarMensagem(data.erro, 'erro');
        } else {
            nomeTarefaInput.value = '';
            buscarTarefas(obterFiltroSelecionado());
            mostrarMensagem('Tarefa adicionada com sucesso.');
        }
    })
    .catch(error => console.error('Erro:', error));
}

function abrirModalEditar(tarefa) {
    tarefaIdEditando = tarefa.id;
    editarNomeTarefa.value = tarefa.nome;
    editarStatusTarefa.checked = tarefa.status;
    modalEditar.style.display = 'block';
}

function salvarEdicao() {
    const nome = editarNomeTarefa.value.trim();
    const status = editarStatusTarefa.checked;

    if (nome === '') {
        mostrarMensagem('Por favor, insira o nome da tarefa.', 'erro');
        return;
    }

    fetch(`/tarefas/${tarefaIdEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.erro) {
            mostrarMensagem(data.erro, 'erro');
        } else {
            modalEditar.style.display = 'none';
            buscarTarefas(obterFiltroSelecionado());
            mostrarMensagem('Tarefa atualizada com sucesso.');
        }
    })
    .catch(error => console.error('Erro:', error));
}

function abrirModalExcluir(id) {
    tarefaIdExcluindo = id;
    modalExcluir.style.display = 'block';
}

function excluirTarefaConfirmada() {
    if (!tarefaIdExcluindo) return;

    fetch(`/tarefas/${tarefaIdExcluindo}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.erro) {
            mostrarMensagem(data.erro, 'erro');
        } else {
            modalExcluir.style.display = 'none';
            buscarTarefas(obterFiltroSelecionado());
            mostrarMensagem(data.mensagem);
        }
    })
    .catch(error => console.error('Erro:', error));
}

function cancelarExclusao() {
    tarefaIdExcluindo = null;
    modalExcluir.style.display = 'none';
}

function obterFiltroSelecionado() {
    for (const elemento of filtroStatus) {
        if (elemento.checked) {
            return elemento.value;
        }
    }
    return 'all';
}

spanFecharEditar.onclick = () => {
    modalEditar.style.display = 'none';
};

spanFecharExcluir.onclick = () => {
    modalExcluir.style.display = 'none';
};

btnCancelarExcluir.onclick = cancelarExclusao;
btnConfirmarExcluir.onclick = excluirTarefaConfirmada;

salvarEdicaoBtn.addEventListener('click', salvarEdicao);
adicionarTarefaBtn.addEventListener('click', adicionarTarefa);

filtroStatus.forEach(radio => {
    radio.addEventListener('change', () => {
        buscarTarefas(obterFiltroSelecionado());
    });
});

window.onclick = (event) => {
    if (event.target == modalEditar) {
        modalEditar.style.display = 'none';
    }
    if (event.target == modalExcluir) {
        modalExcluir.style.display = 'none';
    }
};

buscarTarefas();
