import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  FlatList,
  Keyboard,
  AsyncStorage,
  ActivityIndicator
} from 'react-native';
import Header from './header'
import Footer from './footer'
import Row from './row'

const filterItems = (filter, items) => {
  console.log("items to filter", items)
  if(items)
  {
    return items.filter((item) => {
      if(filter === "All") return true;
      if(filter === "Completed") return item.complete;
      if(filter === "Active") return !item.complete;
    })
  }
  else
  {
    console.log("items null", items)
    return []
  }
}
class App extends Component {
  constructor(props) {
    super(props);
    const ds = [];
    this.state = {
      loading: true,
      value: "",
      items: [],
      showItems: [],
      allComplete: false,
      i: 0,
      filter: "All"   
     }
    this.handleUpdateText = this.handleUpdateText.bind(this);
    this.handleToggleEditing = this.handleToggleEditing.bind(this);
    this.handleClearComplete = this.handleClearComplete.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleToggleComplete = this.handleToggleComplete.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleToggleAllComplete = this.handleToggleAllComplete.bind(this);
  }

  componentWillMount(){
    AsyncStorage.getItem("items").then((json) => {
      try{
        const items = JSON.parse(json);
        this.setState({items: items, showItems: items, loading: false})
        AsyncStorage.setItem("items", JSON.stringify(this.state.items));
      }
      catch(e) {
        console.log(e);
        this.setState({loading: false})
      }
    })
  }
  handleUpdateText(key, text)
  {
    const newItems = this.state.items.map((item) => {
      if(item.key !== key) return item;
      return {
        ... item,
        text
      }
    })
    this.setState({items: newItems, showItems: filterItems(this.state.filter, newItems)})
  }
  handleToggleEditing(key, editing)
  {
    const newItems = this.state.items.map((item) => {
      if(item.key !== key) return item;
      return {
        ... item,
        editing
      }
    })
    this.setState({items: newItems, showItems: filterItems(this.state.filter, newItems)})
  }
  handleClearComplete(){
    const newItems = filterItems("Active", this.state.items);
    this.setState({items: newItems, showItems: filterItems(this.state.filter, newItems)})
    AsyncStorage.setItem("items", JSON.stringify(this.state.items));
  }
  handleFilter(filter)
  {
    this.setState({items: this.state.items, showItems: filterItems(filter, this.state.items)})
    AsyncStorage.setItem("items", JSON.stringify(this.state.items));
  }
  handleRemoveItem(key)
  {
    const newItems = this.state.items.filter((item) => {
      return item.key !== key
    })
    this.setState({items: newItems, showItems: newItems})
    AsyncStorage.setItem("items", JSON.stringify(this.state.items));
    console.log(this.state.items)
  }
  handleToggleComplete(key, complete)
  {
    const newItems = this.state.items.map((item) => {
      if(item.key !== key)
      {
        return item;
      }
      let complete = !item.complete;
      return {
        ...item,
        complete
      }
    })
    this.setState({
      items: newItems,
      showItems: newItems
    })
  }

  handleToggleAllComplete()
  {
    const complete = !this.state.allComplete;
    const newItems = this.state.items.map((item) => ({
      ...item,
      complete
    }))
    this.setState({
      items: newItems,
      showItems: newItems,
      allComplete: complete
    })
    AsyncStorage.setItem("items", JSON.stringify(this.state.items));
  }
  handleAddItem()
  {
    let thisi = this.state.i;
    let nexti = thisi + 1;
    if(!this.state.value)
    {
      return;
    }
    let newItems = this.state.items ? this.state.items : [];
     newItems.push
     ({
       key: thisi.toString(),
       text: this.state.value,
       complete: false
     })

    this.setState({
      items: newItems,
      showItems: newItems,
      value: "",
      i: nexti
    })
    console.log("i:", newItems);
    AsyncStorage.setItem("items", JSON.stringify(this.state.items));
  }

  render()
  {
    return( 
      <View style={styles.container}>
        <Header 
        value={this.state.value}
        onAddItem={this.handleAddItem}
        onChange={(value) => this.setState({value})}
        onToggleAllComplete={this.handleToggleAllComplete}/>
        <View style={styles.content}>
        <FlatList 
          data={this.state.showItems}
          renderItem={({ item }) => 
          <Row 
          complete = {item.complete}
          onUpdate={(text) => this.handleUpdateText(item.key, text)}
          onToggleEdit={(editing) => this.handleToggleEditing(item.key, editing)}
          onComplete={() => this.handleToggleComplete(item.key, item.complete)} 
          onRemove={() => this.handleRemoveItem(item.key)}
          text = {item.text}/>}>
        </FlatList>
        </View>
        <Footer counter = {this.state.showItems.length} 
        onFilter={this.handleFilter} 
        filter={this.state.filter}
        onClearComplete={this.handleClearComplete}/>
        {this.state.loading && <View style={styles.loading}>
          <ActivityIndicator
          animating
          size="large"/>
        </View>}
      </View>
    )
  }
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    ...Platform.select({    
      ios: {paddingTop:30}})
  },
  content : {
    flex: 1
  },
  loading: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "rgba(0,0,0,.2)"
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },

  title: {
    fontSize: 32,
  },
});

export default App;
