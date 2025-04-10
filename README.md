# REDES_AWS

## TOPOLOGIA DE REDE
<img src="https://github.com/user-attachments/assets/ed47c479-eebd-48dd-99c8-a73b0a6a1f6b"></img>

## CRIAÇÃO DO BANCO <br>
**Criar a instância EC2**<br>
Acesse o AWS Console. <br>
Clique em EC2 > Launch Instance. <br>
Name: banco (Nome que você preferir) <br>
AMI: Escolhe Ubuntu Server 22.04 <br>
Instance Type: t2.micro <br>
Key Pair (login): Crie uma nova (baixe o .pem) <br>
Configurações de Rede: <br>
Permitir tráfego SSH (porta 22) <br>
Adicione uma regra para liberar a porta do banco (3306 p/ MySQL) <br>
Tipo: "Custom TCP" <br>
Porta: 3306 <br>
Source: 0.0.0.0/0 <br>
Clique em Launch Instance <br>
**Acessar a EC2 via Terminal** <br>
Acesse o terminal <br>
No terminal acesse a pasta que está sua "chave.pem" <br>
Digite o comando: ssh -i "chave.pem" ubuntu@<ip-público-da-instância> <br>
**Instale o MYSQL** <br>
No temimal digite o comando: sudo apt update <br>
sudo apt install mysql-server -y <br>
Verifique se o banco está rodando, utilizando o comando: sudo systemctl status mysql <br>
**Configurar o banco** <br>
No Terminal, acesse o MySQL, digitando o comando: sudo mysql <br>
**Crie um banco e um usuário** <br>
CREATE DATABASE (nome Banco); <br>
CREATE USER 'user1'@'%' IDENTIFIED BY 'senha123'; <br>
GRANT ALL PRIVILEGES ON reembolso.* TO 'user1'@'%'; <br>
FLUSH PRIVILEGES; <br>
EXIT; <br>
**Libere o acesso Interno:** <br>
No terminal: sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf <br>
Encontre a Linha: bind-address = 127.0.0.1 altere para: bind-address = 0.0.0.0 <br>
Reinicie o serviço: sudo systemctl restart mysql <br> 
**Para Acessar o Banco**
No terminal: sudo systemctl start mysql
Verifique o status do banco: sudo systemctl status mysql
Entre no banco: sudo mysql
SHOW DATABASES;
use NOME_DO_BANCO;
SELECT * FROM NOME_DA_TABLE;









