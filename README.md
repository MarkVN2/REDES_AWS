# REDES_AWS

## TOPOLOGIA DE REDE
<img src="https://github.com/user-attachments/assets/ed47c479-eebd-48dd-99c8-a73b0a6a1f6b"></img>
## Pré requisitos:
* Uma Instância para o load balancer
* Uma Instância para o back-end com a porta 3200 aberta, e com docker instalado
* Uma ou mais instâncias para o front-end com a porta 8080 aberta, e com docker instalado
* Uma Instância para o banco de dados
---
Caso não tenha docker instalado (é necessário sair e entrar novamente, após rodar os comandos):
```
sudo apt update
sudo curl -fsSL https://get.docker.com/ | sh
sudo usermod -aG docker $USER
```

## Back-End
Assim que estiver conectado a sua instância, siga estes passos para criar seu container do backend:
1. Crie uma pasta e arquivo para as configurações de ambiente (exemplo do arquivo abaixo)
```
mkdir dev
cd dev
nano .env
```
```
PORT=3200
DB_NAME=your_db_name_here
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=your_host
DB_DIALECT=mysql
```
2. Retorne ao diretório original, e crie o container no docker, com o volume compartilhando a .env com o container
```
docker run -d -p 3200:3200 -v $(pwd)/dev/.env:/app/.env nininhosam/redes-aws-api
```

## Front-End
Assim que estiver conectado a sua instância, siga estes passos para criar seu container do frontend:
1. Crie uma pasta para as configurações do projeto 
```
mkdir front
cd front
```

2. Crie um arquivo instance.txt com um id qualquer que dará para o container (para ilustrar a funcionalidade do loadbalancer)
```
echo "1" > instance.txt
```

4. Crie seu arquivo docker compose igual ao exemplo
```
nano docker-compose.yml
```
```yml
services:
  frontend:
    image: nininhosam/redes-aws:latest
    container_name: frontend
    ports:
      - "8080:80"
    volumes:
      - ./instance.txt:/usr/share/nginx/html/instance.txt
    restart: unless-stopped
```
5. Crie e Inicie o container
```
docker compose up -d
```


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
**Para Acessar o Banco**<br>
No terminal: sudo systemctl start mysql<br>
Verifique o status do banco: sudo systemctl status mysql<br>
Entre no banco: sudo mysql<br>
SHOW DATABASES;<br>
use NOME_DO_BANCO;<br>
SELECT * FROM NOME_DA_TABLE;<br>









