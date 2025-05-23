# REDES_AWS

## TOPOLOGIA DE REDE
<img src="https://github.com/user-attachments/assets/ed47c479-eebd-48dd-99c8-a73b0a6a1f6b"></img>
## Pré requisitos:

> [!IMPORTANT]
> Todas as instancias devem ter como sistema operacional LINUX

* Uma Instância para o load balancer
* Uma Instância para o back-end com a porta 3200 aberta, e com docker instalado
* Uma ou mais instâncias para o front-end com a porta 8080 aberta, e com docker instalado
* Uma Instância para o banco de dados com a porta 3306 aberta
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
```sh
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
```sh
docker compose up -d
```


## Banco de dados
1. Instale o MySQL
    1. Instale o pacote
    ```
    sudo apt update
    sudo apt install mysql-server -y
    ```

    2. Verifique se o banco está rodando 
    ```
    sudo systemctl status mysql
    ```

2. Configure o MySQL:
    1. Acesse o MySQL
    ```
    sudo mysql
    ```

    2. Crie o banco e usuário
	```sql
	CREATE DATABASE NOME_DO_BANCO;
	CREATE USER 'user1'@'%' IDENTIFIED BY 'senha123';
	GRANT ALL PRIVILEGES ON NOME_DO_BANCO.* TO 'user1'@'%';
	FLUSH PRIVILEGES;
	EXIT;
	```

3. Libere o acesso Interno:
    1. Entre no arquivo de configuração do MySQL
    ```
    sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
    ```

	2. Encontre a Linha `bind-address = 127.0.0.1` e altere para `bind-address = 0.0.0.0`

    3. Reinicie o serviço
	```
	sudo systemctl restart mysql
	```

<br><br>

* Para Acessar o Banco posteriormente:
	1. Iniciar o MySQL
	```
	sudo systemctl start mysql
	```

	2. Verifique o status do banco (opcional) 
	```
	sudo systemctl status mysql
	```

	3. Acesse o MySQL
	```
	sudo mysql
	```

	4. Rode os comandos que quiser (ex)
	```sql
	SHOW DATABASES;
	USE NOME_DO_BANCO;
	SELECT * FROM NOME_DA_TABLE;
	```

## Load-Balancer e bloqueio de IP's 

Após a conexão com a instancia do Load-Balancer instale Nginx, usando o guia presente nesse [link](https://nginx.org/en/linux_packages.html).
Para verificar a instalação com sucesso do Nginx utilize o seguinte comando:
```sh
sudo nginx -v 
```
O comando mostrará a versão do Nginx instalado na maquina, caso ele não funcione verifique novamente sua instalação.

Após uma instalação com sucesso vá até o diretorio de configuração, na distro do Ubuntu essa pasta se localiza em ```/etc/nginx```.
Agora modifique as configurações do Nginx :
```sh
vim nginx.conf # ou nano
```
O arquivo aberto será semelhar a esse em estrutura
```gdscript
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;

}
```

Nesse arquivo em http adicionaremos o seguinte , lembrando de modificar as variaveis IP_MAQUINA_X e as seguintes pelo ip público das suas maquinas do front-end:
```sh
upstream front_end {
  least_conn;
  server IP_MAQUINA_X:8080;
  server IP_MAQUINA_Y:8080;
  server IP_MAQUINA_Z:8080;
}
```

O proximo passo é  adicionar em http o seguinte modificando IP_DOMINIO com o seu dominio, caso não tenha coloque o ip público da maquina do load-balancer : 
```sh
    server {
         listen 80;
         server_name IP_DOMINIO;
         location / {
          proxy_pass http://front_end;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto  $scheme;
         }
    }

```
Após isso bloqueie acesso adicionando dentro de location e trocando IP_PERMITIDO pelo intervalo de IP ou IP permitido acesso a rota / do seu load-balancer 
```sh
  location / {
        allow IP_PERMITIDO;
        deny all;
   }
```

O arquivo final ficará similar a esse:
```
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;
    upstream front_end {
      least_conn;
      server IP_MAQUINA_X:8080;
      server IP_MAQUINA_Y:8080;
      server IP_MAQUINA_Z:8080;
    }
    server {
         listen 80;
         server_name IP_DOMINIO;
         location / {
          allow IP_PERMITIDO;
          deny all;
          proxy_pass http://front_end;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto  $scheme;
         }
    }

}
```
Após essa configuração reinicie o nginx 
```sh
sudo systemctl restart nginx
```
e acesse o ip da máquina do load-balancer.

## VPN

Utilizando a instancia do Load-Balancer instale OpenVPN e easy-rsa seguindo a documentação presente [aqui](https://openvpn.net/community-resources/how-to/#openvpn-quickstart). Também libere a porta 1194/UDP nas configurações da AWS.

Após a instalação crie a pasta do easy-rsa para salvar as chaves e certificados

```sh
make-cadir ~/easy-rsa
cd ~/easy-rsa
```

Dentro da pasta inicie o PKI e crie a CA ( Autoridade Certificadora ), siga os prompts e criei uma senha

```sh
./easyrsa init-pki
./easyrsa build-ca
```

Agora gere as chaves e o certificados para o servidor

```sh
./easyrsa gen-req server nopass
./easyrsa sign-req server server
./easyrsa gen-dh
openvpn --genkey --secret ta.key
```

Copie as chaves e mova-as para o diretorio do OpenVPN

```sh
sudo cp pki/ca.crt pki/issued/server.crt pki/private/server.key pki/dh.pem ta.key /etc/openvpn/
```

Edite o arquivo server.conf dentro do diretorio do OpenVPN

```sh
sudo vim /etc/openvpn/server.conf
```

O arquivo deve ser similar a esse

```sh
port 1194
proto udp
dev tun

ca ca.crt
cert server.crt
key server.key
dh dh.pem

auth SHA256
tls-auth ta.key 0

topology subnet
server 10.8.0.0 255.255.255.0
ifconfig-pool-persist ipp.txt

push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 1.1.1.1"

keepalive 10 120
cipher AES-256-CBC

persist-key
persist-tun
status openvpn-status.log
log-append /var/log/openvpn.log
verb 3
explicit-exit-notify 1
```

em `server 10.8.0.0 255.255.255.0` se define o intervalo de ips dados para uso dos clientes conectados no VPN sendo o primeiro valor o endereço da rede VPN e o segundo a mascara de sub-rede dada a esse endereço modifique ela para mudar o intervalo de rede dado aos usuários.

Após modificar o arquivo de acordo com seu interesse habilite o encaminhamento de IP.

Entre no arquivo de sysctl

```sh
sudo vim /etc/sysctl.conf
```

Adicione ou modifique a seguinte variavel

```
net.ipv4.ip_forward = 1
```

Depois de modificar rode o comando

```sh
sudo sysctl -p
```

Agora modifique a regras do iptablesm, substitua `eth0` pela interface correta.

```sh
sudo iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE
```

Para tornar as configurações permanentes instale `iptables-persistent`

```sh
sudo apt install iptables-persistent
```

e use o seguinte comando

```sh
sudo netfilter-persistent save
```

Agora com tudo configurado inicie o serviço e verifique seu status

```sh
sudo systemctl enable openvpn@server
sudo systemctl start openvpn@server
sudo systemctl status openvpn@server
```

Para acesso dos clientes ao VPN gere os certificados

```sh
cd ~/easy-rsa
./easyrsa gen-req cliente1 nopass
./easyrsa sign-req client cliente1
```

Além da criação desses certificados enviei os arquivos
`a.crt`
`cliente1.crt`
`cliente1.key`
`ta.key`
para o cliente.

Agora crie um arquivo de configuração para o cliente,o arquivo deve ter extensão .ovpn , lembrando de alterar IP_PUBLICO para o ip publico da sua instancia.

```
client
dev tun
proto udp
remote IP_PUBLICO 1194
resolv-retry infinite
nobind
persist-key
persist-tun
ca ca.crt
cert cliente1.crt
key cliente1.key
tls-auth ta.key 1
cipher AES-256-CBC
auth SHA256
verb 3
```

Após enviar os arquivos `a.crt`
`cliente1.crt`
`cliente1.key`
`ta.key`
`cliente1.ovpn`
para o cliente, baixe a aplicação [OpenVPN](https://openvpn.net/community-downloads/) e use a configuração para conectar no VPN.
