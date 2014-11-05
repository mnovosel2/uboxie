Testna verzija aplikacije. Na windowsima mali problemi sa setupom. 
1. u rootu aplikacije pokrenuti npm install npm
2. s CMD-om se navigirati u root aplikacije i onda
   cd {project_root}/node_modules
   mklink /D _ ..\lib
3. u rootu pokrenuti npm install
4. npm start
