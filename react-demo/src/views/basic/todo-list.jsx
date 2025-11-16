/*
 * @Author: zhangjian
 * @Date: 2025-11-11 14:14:57
 * @LastEditTime: 2025-11-11 16:16:38
 * @LastEditors: zhangjian
 * @Description: 基础组件学习2
 */

import { useState } from 'react'


function ProductCategoryRow({category}) {
  return (
    <tr>
      <th>
        {category}
      </th>
    </tr>
  )
}

function ProductRow({product}) {
  const name = product.stocked ? product.name :
    <span style={{color: 'red'}}>
      {product.name}
    </span>;
    
  return (
    <tr>
      <td>
        {name}
      </td>
      <td>
        {product.price}
      </td>
    </tr>
  )
}

function SearchBar({filterText, inStockOnly, onFilterTextChange, onInStockChange}) {
  return (
    <form>
      <input 
        value={filterText} 
        type="text" 
        placeholder="Search..." 
        onChange={e => onFilterTextChange(e.target.value)} />
      <div>
        <label>
          <input 
            type="checkbox" 
            checked={inStockOnly} 
            onChange={e => onInStockChange(e.target.checked)} />
          Only show products in stock
        </label>
      </div>
    </form>
  )
}


function ProductTable({products, filterText, inStockOnly}) {

  const rows = []
  let lastCategory = null

  products.forEach(p => {

    if (inStockOnly && !p.stocked) {
      return;
    }

    if (p.name.toLowerCase().indexOf(filterText.toLowerCase()) === -1) {
      return;
    }

    if (p.category !== lastCategory) {
      rows.push(
        <ProductCategoryRow
          category={p.category}
          key={p.category}
        />
      )
    }

    rows.push(
      <ProductRow
        product={p}
        key={p.name}
      />
    )

    lastCategory = p.category;
  })

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          { rows }
        </tbody>
      </table>
    </div>
  )
}

function FilterableProductTable({products}) {

  const [filterText, setFilterText] = useState('fruit')
  const [inStockOnly, setInStockOnly] = useState(false)
  
  return (
    <div>
      <SearchBar 
        filterText={filterText} 
        inStockOnly={inStockOnly} 
        onFilterTextChange={setFilterText} 
        onInStockChange={setInStockOnly} />
      <ProductTable filterText={filterText} inStockOnly={inStockOnly} products={products} />
    </div>
  )
}

const PRODUCTS = [
  {category: "Fruits", price: "$1", stocked: true, name: "Apple"},
  {category: "Fruits", price: "$1", stocked: true, name: "Dragonfruit"},
  {category: "Fruits", price: "$2", stocked: false, name: "Passionfruit"},
  {category: "Vegetables", price: "$2", stocked: true, name: "Spinach"},
  {category: "Vegetables", price: "$4", stocked: false, name: "Pumpkin"},
  {category: "Vegetables", price: "$1", stocked: true, name: "Peas"}
];

export default function TODOList() {
  
  return <FilterableProductTable products={PRODUCTS} />;
}

