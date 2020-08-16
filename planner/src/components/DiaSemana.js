import React, { useState, useEffect } from 'react';
import '../App';
import styled from 'styled-components';
import axios from "axios";


const Tarefa = styled.p `
    text-align: left;
    text-decoration: ${props => props.isCompleta ? 'line-through' : 'none'};
    cursor: pointer;
`

const DiaSmena =(props) =>{
  const [tarefasDoDia, setTarefasDoDia] = useState([])
  
  useEffect(() =>{
    setTarefasDoDia(props.listaTarefasDia)
  }, [props.listaTarefasDia])
  
  const selecionaTarefa = (id) => {
    props.abrirLoading()
    const novaLista = tarefasDoDia.map((tarefa) => {
      if (tarefa.id === id) {
        const body = {
          completa: !tarefa.completa,
        }
        axios
          .put(`${props.urlBase}/${id}`, body)
          .then(response => {
          })
          .catch(err => {
            props.abrirErro()
          });
        
        return {
          ...tarefa,
          completa: !tarefa.completa
        }
      }
      return tarefa
    })

    setTarefasDoDia(novaLista)
    props.fecharLoading()
  }
   
  const tarefasNaTela = tarefasDoDia.filter((tarefa) =>{
  return tarefa.day === props.titulo
  }).map((tarefa, index) => {
    return <article className="tarefa" id={tarefa.id} key={index}>
        <Tarefa 
          onClick={() => selecionaTarefa(tarefa.id)}
          key={index}
          isCompleta={tarefa.completa}
        > 
           {tarefa.text} &ensp;
           {tarefa.completa ? "✔" : "" }
        </Tarefa>
        
    </article>
  })
  
  return(
      <div className="dia-semana">
        <section class="titulo-dia">{props.titulo}</section>
        <section class="conteudo">{tarefasNaTela}</section>
      </div>
  )
}

export default DiaSmena;