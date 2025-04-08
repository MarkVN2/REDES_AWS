# REDES_AWS

## TOPOLOGIA DE REDE
<img src="https://github.com/user-attachments/assets/ed47c479-eebd-48dd-99c8-a73b0a6a1f6b"></img>

## CRIAÇÃO DO BANCO
**Criar a instância EC2**
Acesse o AWS Console.
Clique em EC2 > Launch Instance.
Name: banco (Nome que você preferir)
AMI: Escolhe Ubuntu Server 22.04
Instance Type: t2.micro 
Key Pair (login): Crie uma nova (baixe o .pem)
Configurações de Rede:
Permitir tráfego SSH (porta 22)
Adicione uma regra para liberar a porta do banco (3306 p/ MySQL)
Tipo: "Custom TCP"
Porta: 3306
Source: 0.0.0.0/0 
Clique em Launch Instance
<br>
**Acessar a EC2 via Terminal**
Acesse o terminal
No terminal acesse a pasta que está sua "chave.pem"
Digite o comando: ssh -i "chave.pem" ubuntu@<ip-público-da-instância>
<br>
**Instale o MYSQL**
No temimal digite o comando: sudo apt update
sudo apt install mysql-server -y
Verifique se o banco está rodando, utilizando o comando: sudo systemctl status mysql
<br>
**Configurar o banco**
No Terminal, acesse o MySQL, digitando o comando: sudo mysql
<br>
**Crie um banco e um usuário**
CREATE DATABASE (nome Banco);
CREATE USER 'user1'@'%' IDENTIFIED BY 'senha123';
GRANT ALL PRIVILEGES ON reembolso.* TO 'user1'@'%';
FLUSH PRIVILEGES;
EXIT;
<br>
**Libere o acesso Interno:**
No terminal: sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
Encontre a Linha: bind-address = 127.0.0.1 altere para: bind-address = 0.0.0.0
Reinicie o serviço: sudo systemctl restart mysql<br>






