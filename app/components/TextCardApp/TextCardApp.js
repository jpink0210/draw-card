import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux'

let store;
let reducer = function(state, action){
  switch(action.type){
    case "AddCard":
      const newCard = {
        text: '卡片 '+state.items.length,
        id: Date.now(),
        // left: document.body.scrollLeft + 100 + Math.floor( 400*Math.random() ) + 'px', 
        // top: document.body.scrollTop + 100+ Math.floor( 400*Math.random() ) + 'px', 
        left: document.body.scrollLeft + 300 + 200*(state.items.length%5) + 'px', 
        top: document.body.scrollTop + 50+ 300*( Math.floor(state.items.length/5) ) + 'px', 
      };
      localStorage.setItem('textStorage', JSON.stringify(state.items.concat(newCard)));
      return  (state.items.length==0) ? {items: [newCard]} :{ items: state.items.concat(newCard) }
    case "Moving":
      let items = state.items;
      items[action.index].left = action.left;
      items[action.index].top = action.top;
      localStorage.setItem('textStorage', JSON.stringify(state.items));
      return {items: items}
    case "Editing":
      let items2 = state.items;
      items2[action.index].text = action.text;
      localStorage.setItem('textStorage', JSON.stringify(state.items));
      return {items: items2}
    case "Removing":
      let subitems = state.items.filter((element, i)=>{
        return action.index !== i;
      });
      localStorage.setItem('textStorage', JSON.stringify(subitems));
      return {items: subitems}  
    case "Upximum":
      const upper = state.items[action.index];
      let subitems2 = state.items.filter((element, i)=>{
        return action.index !== i;
      });
      subitems2.push(upper);
      localStorage.setItem('textStorage', JSON.stringify(subitems2));
      return {items: subitems2}    
    default:
      return state;
  }
}
var textStorage;
if( localStorage.getItem('textStorage') ){
  textStorage = JSON.parse( localStorage.getItem('textStorage') );
}else{
  textStorage = [];
}

store = createStore(reducer,
  { 
    items: textStorage,
    text: ''
  }
);
class TextCardApp extends React.Component {
  constructor(props){
    super(props);
    this.state = store.getState();
  }
  render(){
    return <div>
      <h1>卡片清單</h1>
      <TextCardList />
      <button onClick={ this.addNewCard.bind(this) }>產生新卡片</button>
    </div>;
  }
  addNewCard(){
    store.dispatch({
      type:"AddCard"
    });
  }
}
class TextCardList extends React.Component {
  constructor(props){
    super(props);
    this.state = store.getState();
  }
  render() {
    return (
      <div>
      { this.state.items.map((item, index) => (
        <TextCard 
        item = {item} 
        index={index} 
        key = {index}/>
      ))}
      </div>
    );
  }
  refresh(){
    this.setState(store.getState());
  }
  componentDidMount(){
    store.subscribe(this.refresh.bind(this));
  }
}


class TextCard extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      text: this.props.item.text,
      index: this.props.index,
      editing: false,
      writingText: this.props.item.text
    }
  }
  render() {
    return (
      <div className="generalCard"
      id={this.props.item.id} 
      style={{ top:this.props.item.top,left:this.props.item.left }}
      onDoubleClick = {this.cardMove.bind(this)}
      >
        <div className="textRegion">
          {this.state.editing ? (
            <div>
              <p>請編輯</p>
              <form onSubmit={this.textSubmit.bind(this)}>
                <textarea name="cardtexts" onChange={this.textChange.bind(this)} value={this.state.writingText}></textarea>
                <br/> 
                <input type="submit" value="儲存" />
              </form>
            </div>
          ) : (
            <div className="textContent">
              {this.props.item.text}
            </div>
          )}
        </div>
        <div className="optionRegion">
            {this.state.editing ? (
              ''
            ) : (
              <div>
                <button className="optionBtn" onClick={this.goEdit.bind(this)}>編輯</button>
                <button className="optionBtn" onClick={this.goRemove.bind(this)}>刪除</button>
                <button className="optionBtn" onClick={this.goUpper.bind(this)}>上上</button>
              </div>
            )}
        </div>
      </div>
    );
  }
  goUpper(){
    store.dispatch({
      type: 'Upximum',
      index: this.state.index
    })
  }
  goRemove(){
    store.dispatch({
      type: 'Removing',
      index: this.state.index
    })
  }
  goEdit() {
    var nowWords = store.getState().items[this.props.index].text;
    this.setState({editing: !this.state.editing, writingText: nowWords });
  }
  textChange(e) {
    this.setState({ writingText: e.target.value });
  }
  keyPress(e){
    if(e.key === 'Enter'){
      this.setState({editing: !this.state.editing})
      store.dispatch({
        type: "Editing",
        index: this.state.index,
        text: this.state.writingText
      })
    }
  }
  textSubmit(e) {
    e.preventDefault();
    this.setState({editing: !this.state.editing})
    store.dispatch({
      type: "Editing",
      index: this.state.index,
      text: this.state.writingText
    })
  }
  cardMove () {
    let that = this;
    let box = document.getElementById(this.props.item.id);
    let record_left, record_top;
    document.onmousemove=move;
    box.onmousedown =putdownT;

    function move(e){
      box.style.left=(e.clientX + document.body.scrollLeft - 30)+"px";
      box.style.top=(e.clientY + document.body.scrollTop - 30)+"px";
      record_left = box.style.left;
      record_top = box.style.top;
    }
    function putdownT(){
      document.onmousemove=null; 
      store.dispatch({
        type: 'Moving',
        top: record_top,
        left: record_left,
        index: that.props.index
      });
    }
  }
}
export default TextCardApp;