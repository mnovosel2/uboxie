Testna verzija aplikacije. Na windowsima mali problemi sa setupom. <br>
1. u rootu aplikacije pokrenuti npm install npm<br>
2. u rootu pokrenuti npm install<br>
3. s CMD-om se navigirati u root aplikacije i onda<br>
   <b>cd node_modules</b><br>
   <b>mklink /D _ ..\lib</b><br><br>
Za linux<br>
<b>cd {project_root}/node_modules</b><br>
<b>ln -s ../lib _<b><br>
 
4. povratak u root i npm start<br>
