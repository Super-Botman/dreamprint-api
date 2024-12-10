# Shopping website api

## Table of Contents
1. [Documentation](#api-content)
2. [Technologies](#technologies)
3. [Developer](#developer)
4. [Ressources](#ressources)

## api-content

### Users interaction
#### registration

for register you can execute a post request on url :  
``
http://localhost/users/createUser
``

with this body in json:  
```yaml
{
  "username": "username do you want",
  "password": "password do you want",
  "email": "email do you want"
}
```

#### delete account

for delete on account you can execute a post request on url (don't forget to [login](#login)) :  
``
http://localhost/users/removeAccount
``

with this body in json:
```yaml
{
  "username": "username of the user"
}
```

#### login

for login you can execute a post request on url :  
``
http://localhost/user/login
``

with this body in json:  
```yaml
{
  "username": "username of the user",
  "password": "password of the user"
}
```
when tou have your yoken you can use your token with the header:   
``x-access-token``   
or with json body:  
```yaml
{
  "token": "your token"
}
```

#### logout

for logout you can execute a post request on url (don't forget to [login](#login)) :

``
http://localhost/users/logout
``

with this body in json:
```yaml
{
  "username": "username of the user",
}
```

#### change password

for change password of an account you can execute a put request on url (don't forget to [login](#login)) :  
``
http://localhost/users/changePassword
``

with this body in json:
```yaml
{
  "username": "username of the user",
  "password": "password of the user",
}
```

#### change email

for change email of an account you can execute a put request on url (don't forget to [login](#login)) :  
``
http://localhost/users/changeEmail
``

with this body in json:
```yaml
{
  "username": "username of the user",
  "email": "email of the user",
}
```

### Cart interactions

#### get all items

for get all items you can execute a get request on url (don't forget your token with the same method than [login](#login)):  
``
http://localhost:8080/cart/getItems
``

#### add item

for get items you can execute a get request on url you just have to [login](#login):  
``
http://localhost:8080/cart/newItem
``

```yaml
{
  "name": "the name of our item",
  "description": "a little description",
  "price": 5
}
```

#### delete one item

for modify one message with the id you can execute a put request on url(don't forget your token with the same method than [login](#login)):  
``
http://localhost:8080/cart/deleteItem
``

```yaml
{
  "item": "big print"
}
```

#### delete all items

for delete all items you can execute a get request on url you just have to [login](#login) :  
``
http://localhost:8080/cart/deleteAll
``

## technologies

I use node.js and javascript ES6.

## developer

My name is Super-Botman I have 14 years old, I love cybersecurity and programming !

## ressources

if you have postman i have add a postman config files here https://www.getpostman.com/collections/beb20e8a6d6a10b7cad7
