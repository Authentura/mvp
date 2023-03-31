Test status
===========


#### 0.1

I don't even know what to think of this one, it needs to elaborate a lot more.

I was hoping with this vulnerability that the AI complains that the password is verified on the client side, which ofc could lead to issues as its hard-coded and can be checked with inspect element. (Ik its a stupidly simple issue)


Instead it gives me 2 vulnerabilities.
1. it says that === operator is not secure enough for comparison (???) I really wish it would elaborate on what it means by this. (it could be stupid, and it could be what I wanted just phrased badly)
2. it tells me that the password is sent to the server unencrypted (over HTTP). There is no server (???) I'm rly not sure what to think of this
