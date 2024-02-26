import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  DataTable,
  Page,
  TextField,
  Button,
  Checkbox,
  Select,
} from "@shopify/polaris";
import { debounce } from "lodash";
import axios from "axios";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  commissionPercent?: number;
  [key: string]: string | number | undefined; // Add index signature
}

const CommissionPlanTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [commissionPercentValue, setCommissionPercentValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortedColumn, setSortedColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<
    "ascending" | "descending"
  >("ascending");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:9000/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (selectedCategory !== "All" && product.category !== selectedCategory) {
      return false;
    }
    return product.name.toLowerCase().includes(searchValue.toLowerCase());
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortedColumn) return 0;

    const aValue = a[sortedColumn];
    const bValue = b[sortedColumn];

    // Handle comparison for strings
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "ascending"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Handle comparison for numbers
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "ascending" ? aValue - bValue : bValue - aValue;
    }

    // Default case (if types are different or if either value is undefined)
    return 0;
  });

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleSort = useCallback((selectedColumn: string) => {
    setSortedColumn(selectedColumn);
    setSortDirection((prevDirection) =>
      prevDirection === "ascending" ? "descending" : "ascending"
    );
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
  }, []);

  const handleProductSelection = useCallback(
    (productId: string) => {
      const newSelectedProducts = new Set(selectedProducts);
      if (newSelectedProducts.has(productId)) {
        newSelectedProducts.delete(productId);
      } else {
        newSelectedProducts.add(productId);
      }
      setSelectedProducts(newSelectedProducts);
    },
    [selectedProducts]
  );

  const applyCommissionToSelected = useCallback(async () => {
    try {
      // Disable button if fewer than two products selected
      if (selectedProducts.size < 2) {
        alert("Select at least two products to apply commission.");
        return;
      }

      if (commissionPercentValue === "") {
        alert("You must add a percent.");
        return;
      }

      const response = await axios.put(
        `http://localhost:9000/api/products/commission-update`,
        {
          productIds: Array.from(selectedProducts),
          commissionPercent: parseInt(commissionPercentValue),
        }
      );

      alert("Commission updated successfully");
      setProducts(response.data);
      // Clear selected products
      setSelectedProducts(new Set());
    } catch (error) {
      console.error("Error updating commission:", error);
    }
  }, [selectedProducts, commissionPercentValue]);

  const handleCommissionChange = useCallback(
    async (value: string, productId: string) => {
      const newCommissionPercent = parseInt(value);
      try {
        await axios.put(
          `http://localhost:9000/api/products/${productId}/commission`,
          { commissionPercent: newCommissionPercent }
        );
        const updatedProducts = products.map((product) =>
          product._id === productId
            ? { ...product, commissionPercent: newCommissionPercent }
            : product
        );
        alert("Commission updated successfully");
        setProducts(updatedProducts);
      } catch (error) {
        console.error("Error updating commission for product:", error);
      }
    },
    [products]
  );

  const debouncedSingleCommissionChange = useCallback(
    debounce(
      (value, productId) => handleCommissionChange(value, productId),
      500
    ),
    []
  );

  const handleSelectAllProducts = useCallback(() => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      const allProductIds = paginatedProducts.map((product) => product._id);
      setSelectedProducts(new Set(allProductIds));
    }
  }, [selectedProducts, paginatedProducts]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  return (
    <Page title="Commission Plan Simulator">
      <Card>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TextField
              label="Search Products"
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search by product name"
              autoComplete="off"
            />
            <Select
              label="Filter by Category"
              options={[
                { label: "All", value: "All" },
                ...Array.from(
                  new Set(products.map((product) => product.category))
                ).map((category) => ({ label: category, value: category })),
              ]}
              value={selectedCategory}
              onChange={handleCategoryChange}
            />
          </div>
        </div>
        <DataTable
          columnContentTypes={["text", "text", "text", "text", "numeric"]}
          headings={[
            "",
            "Product Name",
            "Category",
            "Price",
            "Commission Percent",
          ]}
          rows={paginatedProducts.map((product) => [
            <Checkbox
              label="Select product"
              checked={selectedProducts.has(product._id)}
              onChange={() => handleProductSelection(product._id)}
            />,
            product.name,
            product.category,
            `$${product.price}`,
            <TextField
              label=""
              value={
                product.commissionPercent !== undefined
                  ? product.commissionPercent?.toString()
                  : ""
              }
              onChange={(value) =>
                debouncedSingleCommissionChange(value, product._id)
              }
              type="number"
              min={0}
              max={100}
              suffix="%"
              autoComplete="off"
            />,
          ])}
          sortable={[false, true, true, true]}
        />
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <TextField
              label=""
              type="number"
              suffix="%"
              value={commissionPercentValue}
              disabled={selectedProducts.size === 0}
              onChange={(value) => setCommissionPercentValue(value)}
              autoComplete=""
            />
            <Button
              disabled={
                selectedProducts.size < 2 || commissionPercentValue === ""
              }
              onClick={() => applyCommissionToSelected()}
            >
              Apply to selected products
            </Button>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <Button onClick={handleSelectAllProducts}>
              {selectedProducts.size === paginatedProducts.length
                ? "Deselect All"
                : "Select All"}
            </Button>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </Card>
    </Page>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div style={{ display: "inline-block" }}>
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span style={{ margin: "0 10px" }}>
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
};

export default CommissionPlanTable;
