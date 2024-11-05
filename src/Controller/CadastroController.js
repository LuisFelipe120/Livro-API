let Usuario = require('../Model/Cadastro');
const pool = require('./../database/mysql')
const bcrypt = require('bcrypt');

const CadastroController = {
    async criar(req, res) {
        try {
            const {nome, cpf, email, senha, telefone, flag} = req.body;
            console.log(req.file)
            let imgUrl = 'http://localhost:3333/images';
    
            // Verifica se um arquivo de imagem foi enviado
            if (req.file) {
                imgUrl += `${req.file.filename}`;
            }
    
            console.log(senha)
            //verifica se o email ja existe no banco
            const sql_select_existe = `SELECT * from usuarios where email = ?`
            const [result_existe] = await pool.query(sql_select_existe, [email])
            console.log([result_existe])
            if(result_existe[0])
                return res.status(401).json({message: 'Erro ao criar usuario'})
    
            //criptografa o password
            const salt = await bcrypt.genSalt(10);
            const hashSenha = await bcrypt.hash(String(senha), salt);
        let sql = `insert into usuarios (nome, cpf, email, senha, telefone, flag, avatar) VALUES(?,?,?,?,?,?,?)`
   
        const result = await pool.query(sql, [nome,cpf, email, hashSenha, telefone, flag, imgUrl])
        const insertId = result[0]?.insertId;
     
        if(!insertId) {
            return res.status(401).json({message: 'erro ao criar usuario!'})
        }
        const sql_select = 'SELECT * from usuarios where id = ?'
        const [rows] = await pool.query(sql_select, [insertId])
        return res.status(201).json(rows[0])
        } catch (error) {
            console.log(error)
        }
        
    },
  async login(req, res) {
   // pega os dados do body
   const{email, senha} = req.body;
   console.log(senha)
   //monta o select
   const sql_select = `SELECT * from usuarios where email = ?`
   // retorna o select
   const [rows] = await pool.query(sql_select, [email])
   console.log(rows)
   // verifica se existe email 
   if(!rows?.length)
       return res.status(401).json({message: 'Login incorreto'})

   console.log(rows[0]?.senha)
   // compare no hash do password
   const isPasswordValid = await bcrypt.compare(String(senha), String(rows[0]?.senha) )
   console.log(isPasswordValid)
   //se nao der match ou seja password nao eh valido retorna erro
   if(!isPasswordValid)
       return res.status(401).json({message: 'Login incorreto'}) 
   //remove do json a chave password
   delete rows[0]?.senha

   // retorna o usuario
   return res.status(201).json(rows[0])

    
    },

 
    async listar(req, res) {
        // return res.status(200).json(Usuario);
        let sql = "select * from usuarios";
        const [rows] = await pool.query(sql);
        return res.status(200).json(rows);
    },
    async alterar(req, res){
        //pegar o id via parametro da url de requisiçao
        const paramId = req.params.id;
        // return res.status(201).json({id: paramId});
        // //pegou os valores do form via body
        const {nome, cpf, email, senha, telefone, flag} = req.body;
        let imgUrl = 'http://localhost:3333/images/';
    
        // Verifica se um arquivo de imagem foi enviado
        if (req.file) {
            imgUrl += `${req.file.filename}`;
        }
        
        // //recuperar a postagem a partir do id
        // const usuarios = Usuario.find(usuarios => usuarios.id === parseInt(paramId) ? true : false);
        // const usuariosIndex = Usuario.findIndex(usuarios => usuarios.id === parseInt(paramId))
        // usuarios.nome = nome;
        // usuarios.email = email;
        // usuarios.senha = senha;
        // usuarios.cpf = cpf;
        // usuarios.numero = numero;
        // //salvar as alterações
        // Usuario[usuariosIndex] = usuarios;
          
        // return res.status(201).json(usuarios);
        let sql = 'UPDATE usuarios SET nome = ? cpf = ? email = ? senha = ? telefone = ? flag = ? avatar  = ? WHERE id = ?'
        const result = await pool.query(sql, [nome, cpf, email, senha, telefone, flag, imgUrl, Number(paramId)])

        const changedRows = result[0]?.changedRows;
        if(!changedRows){
            return res.status(401).json({message:'erro ao atualizar o usuario!'})
        }
        const sql_select = `SELECT * FROM usuarios WHERE id = ?`
        const [rows] = await pool.query(sql_select, [paramId])
        return res.status(201).json(rows[0])
    },
    async show(req, res){
        const paramId = req.params.id;
        // const usuarios = Usuario.find(usuarios => usuarios.id === parseInt(paramId) ? true : false);
        // return res.status(201).json(usuarios);
        const sql_select = `SELECT * FROM usuarios WHERE id = ?`
        const [rows] = await pool.query(sql_select, Number(paramId))
        return res.status(201).json(rows[0])
    },
    async deletar(req, res){
        const paramId = req.params.id;
    //     const usuariosIndex = Usuario.findIndex(usuarios => usuarios.id === parseInt(paramId))
    //     Usuario=[
    //         ...Usuario.slice(0 ,usuariosIndex),
    //         ...Usuario.slice(usuariosIndex+1, Usuario.length)
    // ]
    //     return res.status(200).json({mensagem: "Usuario deletado com sucesso!"})
    // }
    let sql = `DELETE FROM usuarios WHERE id = ?`
    const result = await pool.query(sql, [Number(paramId)])
    console.log(result)
     const affectedRows = result[0]?.affectedRows;
     if(!affectedRows){
         return res.status(401).json({message:'erro ao deletar o usuario!'})
     }
    return res.status(200).json({mensagem: "Usuario deletado com sucesso!"})
     
}
}
module.exports = CadastroController;