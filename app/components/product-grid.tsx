"use client"

import Image from "next/image"
import { PlusCircle, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import useSWR from "swr"

import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "../context/cart-context"
import type { Product } from "../context/cart-context"

interface ProductGridProps {
  category: string
  searchQuery: string
}

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
})

export default function ProductGrid({ category, searchQuery }: ProductGridProps) {
  const { addToCart } = useCart()
  const { data: allProducts = [], error, isLoading } = useSWR<Product[]>('/api/products', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000,
  })



  const filteredProducts = allProducts.filter((product) => {
    const productCategory = product.category?.toLowerCase() || ''
    const matchesCategory = category === "all" || productCategory === category.toLowerCase()
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  }).map(product => ({
    ...product,
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
  }))

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="col-span-full py-12 text-center text-muted-foreground">
          Loading products...
        </div>
      ) : error ? (
        <div className="col-span-full py-12 text-center">
          <p className="text-red-500 font-medium">Failed to load products</p>
          <p className="text-sm text-muted-foreground mt-2">Please refresh the page or contact support</p>
        </div>
      ) : allProducts.length === 0 ? (
        <div className="col-span-full py-12 text-center">
          <p className="text-muted-foreground">No products found in database</p>
          <p className="text-xs text-muted-foreground mt-1">Database may need to be seeded with product data</p>
        </div>
      ) : (
        <>
          {filteredProducts.length === 0 && allProducts.length > 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">No products match your search</p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-max">
              {filteredProducts.map((product) => {
                const isSoldOut = !product.stock || product.stock <= 0
                
                return (
                <Card
                  key={product.id}
                  className={`overflow-hidden transition-all duration-200 ${!isSoldOut ? 'hover:shadow-lg hover:border-primary cursor-pointer group' : 'opacity-60 cursor-not-allowed'}`}
                  onClick={() => !isSoldOut && addToCart(product)}
                >
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    {isSoldOut && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="h-8 w-8 text-white" />
                          <span className="text-white font-bold text-center text-sm">SOLD OUT</span>
                        </div>
                      </div>
                    )}
                    <div className={`absolute inset-0 flex items-center justify-center ${isSoldOut ? 'bg-black/0' : 'bg-black/0 group-hover:bg-black/40'} transition-colors duration-200 z-10`}>
                      {!isSoldOut && (
                        <PlusCircle className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      )}
                    </div>
                    <Image 
                      src={product.image || "/placeholder.svg"} 
                      alt={product.name} 
                      fill 
                      className={`object-cover ${!isSoldOut ? 'group-hover:scale-110' : ''} transition-transform duration-200`}
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                    />
                  </div>
                  <CardContent className="p-3 space-y-1">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{product.name}</h3>
                    <p className="text-base font-bold text-primary">${product.price.toFixed(2)}</p>
                    {!isSoldOut && product.stock && product.stock < 10 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Only {product.stock} left</p>
                    )}
                  </CardContent>
                </Card>
              )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
