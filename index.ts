
import fastify from 'fastify';
import cors from '@fastify/cors';
import mysql from 'mysql2/promise';

const app = fastify();
app.register(cors);

const config = {
    host: "localhost",
    user: "root",
    password: "",
    database: "ListarTarefas",
    port: 3306
};

app.get('/', async (request, reply) => {
    reply.send("API Tarefas funcionando!");
});

app.get('/tarefas', async (request, reply) => {
    try {
        const conn = await mysql.createConnection(config);
        const [dados] = await conn.query("SELECT * FROM tarefas");
        reply.status(200).send(dados);
    } catch (erro: any) {
        tratarErroMySQL(erro, reply);
    }
});

app.post('/tarefas', async (request, reply) => {
    try {
        const { descricao, prazoInicial, prazoFinal } = request.body as {
            descricao: string;
            prazoInicial: string;
            prazoFinal: string;
        };

        if (!descricao || descricao.trim() === "") {
            return reply.status(400).send({ mensagem: "Descrição é obrigatória" });
        }

        const conn = await mysql.createConnection(config);
        await conn.query("INSERT INTO tarefas (descricao, prazoInicial, prazoFinal) VALUES (?, ?, ?)",[descricao, prazoInicial, prazoFinal]);
        reply.status(201).send({ mensagem: "Tarefa cadastrada com sucesso" });
    } catch (erro: any) {
        tratarErroMySQL(erro, reply);
    }
});

app.post('/disciplinas', async (request, reply) => {
    try {
        const { materia, professor, curso } = request.body as { materia: string, professor: string, curso: string };

        if (!materia || !professor || !curso) {
            return reply.status(400).send({ mensagem: "Todos os campos são obrigatórios" });
        }

        const conn = await mysql.createConnection(config);
        await conn.query("INSERT INTO disciplinas (materia, professor, curso) VALUES (?, ?, ?)", [materia, professor, curso]);
        reply.status(201).send({ mensagem: "Disciplina cadastrada com sucesso" });
    } catch (erro: any) {
        tratarErroMySQL(erro, reply);
    }
});
app.get('/disciplinas', async (request, reply) => {
    try {
        const conn = await mysql.createConnection(config);
        const [dados] = await conn.query("SELECT * FROM disciplinas");
        reply.status(200).send(dados);
    } catch (erro: any) {
        tratarErroMySQL(erro, reply);
    }
});

 

// Função para citar os erros 
function tratarErroMySQL(erro: any, reply: any) {
    if (erro.code === 'ECONNREFUSED') {
        console.log("ERRO: LIGUE O LARAGÃO => Conexão Recusada");
        reply.status(400).send({ mensagem: "ERRO: LIGUE O LARAGÃO => Conexão Recusada" });
    } else if (erro.code === 'ER_BAD_DB_ERROR') {
        console.log("ERRO: CRIE UM BANCO DE DADOS COM O NOME DEFINIDO NA CONEXÃO");
        reply.status(400).send({ mensagem: "ERRO: CRIE UM BANCO DE DADOS COM O NOME DEFINIDO NA CONEXÃO" });
    } else if (erro.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log("ERRO: CONFERIR O USUÁRIO E SENHA DEFINIDOS NA CONEXÃO");
        reply.status(400).send({ mensagem: "ERRO: CONFERIR O USUÁRIO E SENHA DEFINIDOS NA CONEXÃO" });
    } else if (erro.code === 'ER_NO_SUCH_TABLE') {
        console.log("ERRO: Você deve criar a tabela com o mesmo nome da sua QUERY");
        reply.status(400).send({ mensagem: "ERRO: Você deve criar a tabela com o mesmo nome da sua QUERY" });
    } else if (erro.code === 'ER_PARSE_ERROR') {
        console.log("ERRO: Você tem um erro de escrita em sua QUERY (verifique vírgulas, parênteses, nomes...)");
        reply.status(400).send({ mensagem: "ERRO: Você tem um erro de escrita em sua QUERY (verifique vírgulas, parênteses, nomes...)" });
    } else {
        console.log("ERRO DESCONHECIDO:", erro);
        reply.status(404).send({ mensagem: "ERRO: NÃO IDENTIFICADO" });
    }
}

app.listen({ port: 8000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Servidor rodando em ${address}`);
});
