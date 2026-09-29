import {
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  Eye,
  Filter,
  Package,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import { useProductStore } from "../../store/productStore";
import { useAuthStore } from "../../store/authStore";

import { categories as defaultCategories } from "../../data/categories";

import { storage } from "../../utils/storage";

import type { Product } from "../../types/product";
import type {
  Order,
  OrderStatus,
} from "../../types/order";

type Tab =
  | "overview"
  | "products"
  | "orders"
  | "customers"
  | "analytics";

interface AdminCategory {
  id: string;
  name: string;
  icon: string;
}

const ORDERS_KEY = "shopsphere_orders";
const CATEGORIES_KEY = "shopsphere_admin_categories";

const initialCategories: AdminCategory[] =
  defaultCategories.map((category) => ({
    id: category.id,
    name: category.name,
    icon: category.icon,
  }));

const orderStatuses: OrderStatus[] = [
  "Placed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

function Admin() {
  /*
   * ---------------------------------------------------
   * GLOBAL PRODUCT CATALOGUE
   * ---------------------------------------------------
   */
  const products = useProductStore(
    (state) => state.items,
  );

  const addProduct = useProductStore(
    (state) => state.addProduct,
  );

  const updateProduct = useProductStore(
    (state) => state.updateProduct,
  );

  const deleteProduct = useProductStore(
    (state) => state.deleteProduct,
  );

  /*
   * ---------------------------------------------------
   * GLOBAL USERS
   * ---------------------------------------------------
   */
  const users = useAuthStore(
    (state) => state.users,
  );

  /*
   * ---------------------------------------------------
   * GLOBAL ORDERS
   * ---------------------------------------------------
   */
  const [orders, setOrders] = useState<Order[]>(
    () =>
      storage.get<Order[]>(
        ORDERS_KEY,
        [],
      ),
  );

  /*
   * ---------------------------------------------------
   * GLOBAL CATEGORIES
   * ---------------------------------------------------
   */
  const [adminCategories, setAdminCategories] =
    useState<AdminCategory[]>(() =>
      storage.get<AdminCategory[]>(
        CATEGORIES_KEY,
        initialCategories,
      ),
    );

  /*
   * ---------------------------------------------------
   * UI STATE
   * ---------------------------------------------------
   */
  const [activeTab, setActiveTab] =
    useState<Tab>("overview");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [productSearch, setProductSearch] =
    useState("");

  const [orderSearch, setOrderSearch] =
    useState("");

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [productCategory, setProductCategory] =
    useState("all");

  const [orderStatusFilter, setOrderStatusFilter] =
    useState<"all" | OrderStatus>("all");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [showProductModal, setShowProductModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState<Product | null>(null);

  const [toast, setToast] =
    useState("");

  /*
   * ---------------------------------------------------
   * PRODUCT FORM
   * ---------------------------------------------------
   */
  const emptyProductForm: Product = {
    id: 0,
    title: "",
    description: "",
    category:
      adminCategories[0]?.id ?? "electronics",
    price: 0,
    discountPercentage: 0,
    rating: 4,
    stock: 0,
    brand: "",
    thumbnail: "",
    images: [""],
  };

  const [productForm, setProductForm] =
    useState<Product>(
      emptyProductForm,
    );

  /*
   * ---------------------------------------------------
   * CUSTOMER DATA
   * ---------------------------------------------------
   */
  const customers = useMemo(() => {
    return users.filter(
      (user) => user.role !== "admin",
    );
  }, [users]);

  /*
   * ---------------------------------------------------
   * ORDER DATA
   * ---------------------------------------------------
   */
  const customerOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.shippingAddress?.email,
    );
  }, [orders]);

  /*
   * ---------------------------------------------------
   * OVERVIEW METRICS
   * ---------------------------------------------------
   */
  const totalRevenue = useMemo(() => {
    return orders.reduce(
      (sum, order) =>
        sum + order.total,
      0,
    );
  }, [orders]);

  const activeOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status !== "Delivered" &&
        order.status !== "Cancelled",
    ).length;
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.stock <= 10,
    );
  }, [products]);

  const averageOrderValue = useMemo(() => {
    if (orders.length === 0) {
      return 0;
    }

    return totalRevenue / orders.length;
  }, [orders, totalRevenue]);

  /*
   * ---------------------------------------------------
   * TOP PRODUCTS
   * ---------------------------------------------------
   */
  const topProducts = useMemo(() => {
    const salesMap = new Map<
      number,
      number
    >();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const current =
          salesMap.get(item.product.id) ?? 0;

        salesMap.set(
          item.product.id,
          current + item.quantity,
        );
      });
    });

    return products
      .map((product) => ({
        product,
        sales:
          salesMap.get(product.id) ?? 0,
      }))
      .sort(
        (a, b) =>
          b.sales - a.sales,
      )
      .slice(0, 5);
  }, [orders, products]);

  /*
   * ---------------------------------------------------
   * FILTERED PRODUCTS
   * ---------------------------------------------------
   */
  const filteredProducts = useMemo(() => {
    const term =
      productSearch
        .trim()
        .toLowerCase();

    return products.filter(
      (product) => {
        const matchesSearch =
          !term ||
          product.title
            .toLowerCase()
            .includes(term) ||
          product.brand
            .toLowerCase()
            .includes(term);

        const matchesCategory =
          productCategory ===
          "all" ||
          product.category ===
            productCategory;

        return (
          matchesSearch &&
          matchesCategory
        );
      },
    );
  }, [
    products,
    productSearch,
    productCategory,
  ]);

  /*
   * ---------------------------------------------------
   * FILTERED ORDERS
   * ---------------------------------------------------
   */
  const filteredOrders = useMemo(() => {
    const term =
      orderSearch
        .trim()
        .toLowerCase();

    return orders.filter(
      (order) => {
        const customerName =
          order.shippingAddress?.fullName?.toLowerCase() ??
          "";

        const customerEmail =
          order.shippingAddress?.email?.toLowerCase() ??
          "";

        const matchesSearch =
          !term ||
          order.id
            .toLowerCase()
            .includes(term) ||
          customerName.includes(term) ||
          customerEmail.includes(term);

        const matchesStatus =
          orderStatusFilter ===
            "all" ||
          order.status ===
            orderStatusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      },
    );
  }, [
    orders,
    orderSearch,
    orderStatusFilter,
  ]);

  /*
   * ---------------------------------------------------
   * FILTERED CUSTOMERS
   * ---------------------------------------------------
   */
  const filteredCustomers =
    useMemo(() => {
      const term =
        customerSearch
          .trim()
          .toLowerCase();

      return customers.filter(
        (customer) =>
          !term ||
          customer.name
            .toLowerCase()
            .includes(term) ||
          customer.email
            .toLowerCase()
            .includes(term),
      );
    }, [
      customers,
      customerSearch,
    ]);

  /*
   * ---------------------------------------------------
   * CUSTOMER ORDER COUNTS
   * ---------------------------------------------------
   */
  const getCustomerOrders = (
    email: string,
  ) => {
    return orders.filter(
      (order) =>
        order.shippingAddress.email
          .toLowerCase() ===
        email.toLowerCase(),
    );
  };

  /*
   * ---------------------------------------------------
   * TAB CHANGE
   * ---------------------------------------------------
   */
  const changeTab = (tab: Tab) => {
    setActiveTab(tab);

    setSearchTerm("");
    setProductSearch("");
    setOrderSearch("");
    setCustomerSearch("");
  };

  /*
   * ---------------------------------------------------
   * TOAST
   * ---------------------------------------------------
   */
  const showToast = (
    message: string,
  ) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2500);
  };

  /*
   * ---------------------------------------------------
   * OPEN ADD PRODUCT
   * ---------------------------------------------------
   */
  const handleAddProduct = () => {
    const nextId =
      products.length > 0
        ? Math.max(
            ...products.map(
              (product) =>
                product.id,
            ),
          ) + 1
        : 1;

    setEditingProduct(null);

    setProductForm({
      ...emptyProductForm,
      id: nextId,
      category:
        adminCategories[0]?.id ??
        "electronics",
    });

    setShowProductModal(true);
  };

  /*
   * ---------------------------------------------------
   * OPEN EDIT PRODUCT
   * ---------------------------------------------------
   */
  const handleEditProduct = (
    product: Product,
  ) => {
    setEditingProduct(product);

    setProductForm({
      ...product,
      images:
        product.images.length > 0
          ? product.images
          : [product.thumbnail],
    });

    setShowProductModal(true);
  };

  /*
   * ---------------------------------------------------
   * SAVE PRODUCT
   * ---------------------------------------------------
   */
  const handleSaveProduct = () => {
    if (
      !productForm.title.trim() ||
      !productForm.brand.trim() ||
      !productForm.description.trim() ||
      !productForm.thumbnail.trim()
    ) {
      showToast(
        "Please fill all required product fields.",
      );
      return;
    }

    const cleanedProduct: Product = {
      ...productForm,
      title: productForm.title.trim(),
      brand: productForm.brand.trim(),
      description:
        productForm.description.trim(),
      thumbnail:
        productForm.thumbnail.trim(),
      images:
        productForm.images.filter(
          (image) => image.trim(),
        ),
      price: Number(
        productForm.price,
      ),
      discountPercentage: Number(
        productForm.discountPercentage,
      ),
      rating: Number(
        productForm.rating,
      ),
      stock: Number(
        productForm.stock,
      ),
    };

    if (editingProduct) {
      updateProduct(cleanedProduct);

      showToast(
        "Product updated successfully.",
      );
    } else {
      addProduct(cleanedProduct);

      showToast(
        "Product added successfully.",
      );
    }

    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm(
      emptyProductForm,
    );
  };

  /*
   * ---------------------------------------------------
   * DELETE PRODUCT
   * ---------------------------------------------------
   */
  const handleDeleteProduct = (
    product: Product,
  ) => {
    const isUsedInOrder =
      orders.some((order) =>
        order.items.some(
          (item) =>
            item.product.id ===
            product.id,
        ),
      );

    if (isUsedInOrder) {
      showToast(
        "This product cannot be deleted because it exists in order history.",
      );

      setShowDeleteModal(null);
      return;
    }

    deleteProduct(product.id);

    showToast(
      "Product deleted successfully.",
    );

    setShowDeleteModal(null);
  };

  /*
   * ---------------------------------------------------
   * CATEGORY MANAGEMENT
   * ---------------------------------------------------
   */
  const handleAddCategory = () => {
    const name =
      window.prompt(
        "Enter new category name:",
      );

    if (!name?.trim()) {
      return;
    }

    const cleanName =
      name.trim();

    const exists =
      adminCategories.some(
        (category) =>
          category.name.toLowerCase() ===
          cleanName.toLowerCase(),
      );

    if (exists) {
      showToast(
        "Category already exists.",
      );
      return;
    }

    const id =
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(
          /^-|-$/g,
          "",
        );

    const newCategory: AdminCategory = {
      id,
      name: cleanName,
      icon: "🛍️",
    };

    const updated = [
      ...adminCategories,
      newCategory,
    ];

    setAdminCategories(updated);

    storage.set(
      CATEGORIES_KEY,
      updated,
    );

    showToast(
      "Category added successfully.",
    );
  };

  /*
   * ---------------------------------------------------
   * UPDATE ORDER STATUS
   * ---------------------------------------------------
   */
  const handleAdvanceOrder = (
    order: Order,
  ) => {
    const currentIndex =
      orderStatuses.indexOf(
        order.status,
      );

    if (
      currentIndex === -1 ||
      order.status ===
        "Delivered" ||
      order.status ===
        "Cancelled"
    ) {
      return;
    }

    const nextStatus =
      orderStatuses[
        currentIndex + 1
      ];

    if (!nextStatus) {
      return;
    }

    const updatedOrders =
      orders.map(
        (item) =>
          item.id === order.id
            ? {
                ...item,
                status:
                  nextStatus,
              }
            : item,
      );

    setOrders(
      updatedOrders,
    );

    storage.set(
      ORDERS_KEY,
      updatedOrders,
    );

    if (
      selectedOrder?.id ===
      order.id
    ) {
      setSelectedOrder({
        ...order,
        status:
          nextStatus,
      });
    }

    showToast(
      `Order status changed to ${nextStatus}.`,
    );
  };

  /*
   * ---------------------------------------------------
   * RECOMMENDATION ANALYTICS
   *
   * These are deliberately marked LOCAL / SIMULATED.
   * They do not use the current admin user's cart or
   * wishlist.
   * ---------------------------------------------------
   */
  const analytics = useMemo(() => {
    const impressions =
      Math.max(
        50,
        products.length * 8 +
          orders.length * 12,
      );

    const clicks =
      Math.max(
        10,
        products.length * 2 +
          orders.length * 5,
      );

    const conversions =
      orders.length;

    const ctr =
      impressions > 0
        ? (clicks /
            impressions) *
          100
        : 0;

    const conversionRate =
      clicks > 0
        ? (conversions /
            clicks) *
          100
        : 0;

    return {
      impressions,
      clicks,
      conversions,
      ctr,
      conversionRate,
    };
  }, [
    products.length,
    orders.length,
  ]);

  const strategyNames = [
    "Recently Viewed",
    "Similar Products",
    "Category Based",
    "Wishlist Based",
    "Cart Based",
    "Purchase Based",
    "Popular",
    "Price Based",
    "Rating Based",
  ];

  /*
   * ---------------------------------------------------
   * SIDEBAR
   * ---------------------------------------------------
   */
  const tabs: Array<{
    id: Tab;
    label: string;
    icon: typeof BarChart3;
  }> = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
    },
    {
      id: "products",
      label: "Products",
      icon: Boxes,
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingBag,
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
    },
    {
      id: "analytics",
      label: "Recommendation Analytics",
      icon: TrendingUp,
    },
  ];

  return (
    <main className="min-h-screen bg-[#fffaf0]">
      {/* ==================================================
          TOAST
      =================================================== */}
      {toast && (
        <div className="fixed right-4 top-5 z-[9999] rounded-2xl bg-white px-5 py-4 shadow-2xl ring-1 ring-green-100">
          <div className="flex items-center gap-3">
            <CheckCircle2
              size={20}
              className="text-green-600"
            />

            <p className="text-sm font-bold text-[#29221b]">
              {toast}
            </p>
          </div>
        </div>
      )}

      {/* ==================================================
          HEADER
      =================================================== */}
      <section className="border-b border-orange-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8b5cf6]">
                SHOPSPHERE AI
              </p>

              <h1 className="mt-1 text-3xl font-black text-[#29221b] sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-sm text-[#7c6a54]">
                Manage the global ShopSphere
                marketplace data.
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] px-5 py-3 text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wide text-white/75">
                Admin Workspace
              </p>

              <p className="mt-1 font-black">
                Global Platform Data
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          MAIN LAYOUT
      =================================================== */}
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row lg:px-8 lg:py-8">
        {/* ==================================================
            SIDEBAR
        =================================================== */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white p-3 shadow-sm">
            <div className="mb-3 rounded-2xl bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] p-4 text-white">
              <p className="text-xs font-bold text-white/75">
                MANAGEMENT
              </p>

              <p className="mt-1 text-lg font-black">
                ShopSphere Admin
              </p>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                const active =
                  activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      changeTab(tab.id)
                    }
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                      active
                        ? "bg-gradient-to-r from-orange-100 to-pink-100 text-[#d97706] shadow-sm"
                        : "text-[#6b5b47] hover:bg-orange-50"
                    }`}
                  >
                    <Icon size={18} />

                    <span className="flex-1">
                      {tab.label}
                    </span>

                    {active && (
                      <ChevronRight
                        size={16}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ==================================================
            CONTENT
        =================================================== */}
        <section className="min-w-0 flex-1">
          {/* ==================================================
              OVERVIEW
          =================================================== */}
          {activeTab ===
            "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-[#8c7a63]">
                        Products
                      </p>

                      <p className="mt-2 text-3xl font-black text-[#29221b]">
                        {products.length}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#d97706]">
                      <Package
                        size={23}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-[#8c7a63]">
                        Customers
                      </p>

                      <p className="mt-2 text-3xl font-black text-[#29221b]">
                        {customers.length}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-[#8b5cf6]">
                      <Users
                        size={23}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-[#8c7a63]">
                        Orders
                      </p>

                      <p className="mt-2 text-3xl font-black text-[#29221b]">
                        {orders.length}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-[#ec4899]">
                      <ShoppingBag
                        size={23}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-[#8c7a63]">
                        Revenue
                      </p>

                      <p className="mt-2 text-2xl font-black text-[#29221b]">
                        {formatCurrency(
                          totalRevenue,
                        )}
                      </p>

                      <p className="mt-1 text-xs font-bold text-[#a6957e]">
                        Simulated local revenue
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-[#d97706]">
                      <CircleDollarSign
                        size={23}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary metrics */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8c7a63]">
                    Active Orders
                  </p>

                  <p className="mt-2 text-2xl font-black text-[#29221b]">
                    {activeOrders}
                  </p>

                  <p className="mt-1 text-xs text-[#8c7a63]">
                    Orders not yet delivered
                  </p>
                </div>

                <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8c7a63]">
                    Average Order Value
                  </p>

                  <p className="mt-2 text-2xl font-black text-[#29221b]">
                    {formatCurrency(
                      averageOrderValue,
                    )}
                  </p>
                </div>

                <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8c7a63]">
                    Low Stock
                  </p>

                  <p className="mt-2 text-2xl font-black text-[#ef476f]">
                    {lowStockProducts.length}
                  </p>

                  <p className="mt-1 text-xs text-[#8c7a63]">
                    Products with 10 or fewer units
                  </p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-[#29221b]">
                      Recent Orders
                    </h2>

                    <p className="mt-1 text-sm text-[#8c7a63]">
                      All customer orders on the platform.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      changeTab(
                        "orders",
                      )
                    }
                    className="w-fit rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-4 py-2 text-sm font-black text-white shadow-md"
                  >
                    View All Orders
                  </button>
                </div>

                <div className="mt-5 overflow-x-auto">
                  {orders.length ===
                  0 ? (
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 px-6 py-10 text-center">
                      <ShoppingBag
                        size={35}
                        className="mx-auto text-orange-300"
                      />

                      <p className="mt-3 font-bold text-[#6b5b47]">
                        No orders yet.
                      </p>
                    </div>
                  ) : (
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-orange-100 text-xs uppercase tracking-wide text-[#8c7a63]">
                          <th className="px-3 py-3">
                            Order
                          </th>

                          <th className="px-3 py-3">
                            Customer
                          </th>

                          <th className="px-3 py-3">
                            Date
                          </th>

                          <th className="px-3 py-3">
                            Total
                          </th>

                          <th className="px-3 py-3">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {orders
                          .slice(0, 6)
                          .map((order) => (
                            <tr
                              key={
                                order.id
                              }
                              className="border-b border-orange-50 last:border-0"
                            >
                              <td className="px-3 py-4 font-black text-[#29221b]">
                                #{order.id}
                              </td>

                              <td className="px-3 py-4">
                                <p className="font-bold text-[#29221b]">
                                  {
                                    order
                                      .shippingAddress
                                      .fullName
                                  }
                                </p>

                                <p className="text-xs text-[#8c7a63]">
                                  {
                                    order
                                      .shippingAddress
                                      .email
                                  }
                                </p>
                              </td>

                              <td className="px-3 py-4 text-[#6b5b47]">
                                {new Date(
                                  order.createdAt,
                                ).toLocaleDateString(
                                  "en-IN",
                                )}
                              </td>

                              <td className="px-3 py-4 font-black text-[#d97706]">
                                {formatCurrency(
                                  order.total,
                                )}
                              </td>

                              <td className="px-3 py-4">
                                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-[#7c3aed]">
                                  {
                                    order.status
                                  }
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Low Stock */}
              <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                    <Boxes
                      size={21}
                    />
                  </div>

                  <div>
                    <h2 className="font-black text-[#29221b]">
                      Inventory Alerts
                    </h2>

                    <p className="text-sm text-[#8c7a63]">
                      Products that may need restocking.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {lowStockProducts
                    .slice(0, 6)
                    .map(
                      (
                        product,
                      ) => (
                        <div
                          key={
                            product.id
                          }
                          className="rounded-2xl bg-red-50 p-4"
                        >
                          <p className="font-black text-[#29221b]">
                            {
                              product.title
                            }
                          </p>

                          <p className="mt-1 text-sm font-bold text-red-600">
                            {product.stock}{" "}
                            left in stock
                          </p>
                        </div>
                      ),
                    )}

                  {lowStockProducts.length ===
                    0 && (
                    <div className="rounded-2xl bg-green-50 p-4 sm:col-span-2 lg:col-span-3">
                      <p className="font-bold text-green-700">
                        No low-stock products right now.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-[#8b5cf6]">
                    <TrendingUp
                      size={21}
                    />
                  </div>

                  <div>
                    <h2 className="font-black text-[#29221b]">
                      Top Products
                    </h2>

                    <p className="text-sm text-[#8c7a63]">
                      Based on global local order history.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {topProducts.map(
                    ({
                      product,
                      sales,
                    }) => (
                      <div
                        key={
                          product.id
                        }
                        className="flex items-center gap-4 rounded-2xl bg-[#fffaf0] p-3"
                      >
                        <img
                          src={
                            product.thumbnail
                          }
                          alt={
                            product.title
                          }
                          className="h-14 w-14 rounded-xl object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-black text-[#29221b]">
                            {
                              product.title
                            }
                          </p>

                          <p className="mt-1 text-xs font-bold text-[#8c7a63]">
                            {sales}{" "}
                            units
                            ordered
                          </p>
                        </div>

                        <p className="font-black text-[#d97706]">
                          {formatCurrency(
                            product.price,
                          )}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              PRODUCTS
          =================================================== */}
          {activeTab ===
            "products" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[#29221b]">
                      Product Management
                    </h2>

                    <p className="mt-1 text-sm text-[#8c7a63]">
                      This catalogue is shared with customer-facing product pages.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleAddProduct
                    }
                    className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-5 py-3 text-sm font-black text-white shadow-lg"
                  >
                    <Plus
                      size={18}
                    />
                    Add Product
                  </button>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a6957e]"
                    />

                    <input
                      value={
                        productSearch
                      }
                      onChange={(
                        event,
                      ) =>
                        setProductSearch(
                          event.target.value,
                        )
                      }
                      placeholder="Search products or brands..."
                      className="w-full rounded-xl border border-orange-100 bg-[#fffaf0] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#f59e0b]"
                    />
                  </div>

                  <select
                    value={
                      productCategory
                    }
                    onChange={(
                      event,
                    ) =>
                      setProductCategory(
                        event.target.value,
                      )
                    }
                    className="rounded-xl border border-orange-100 bg-[#fffaf0] px-4 py-3 text-sm font-bold outline-none focus:border-[#f59e0b]"
                  >
                    <option value="all">
                      All Categories
                    </option>

                    {adminCategories.map(
                      (
                        category,
                      ) => (
                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >
                          {
                            category.name
                          }
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {adminCategories.map(
                    (category) => (
                      <span
                        key={
                          category.id
                        }
                        className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-[#d97706]"
                      >
                        {category.icon}{" "}
                        {
                          category.name
                        }
                      </span>
                    ),
                  )}

                  <button
                    type="button"
                    onClick={
                      handleAddCategory
                    }
                    className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 text-xs font-black text-[#8b5cf6]"
                  >
                    + Add Category
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-[#29221b]">
                      {filteredProducts.length}{" "}
                      products
                    </p>

                    <p className="text-xs text-[#8c7a63]">
                      Global catalogue
                    </p>
                  </div>
                </div>

                {filteredProducts.length ===
                0 ? (
                  <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/30 px-6 py-14 text-center">
                    <Package
                      size={40}
                      className="mx-auto text-orange-300"
                    />

                    <p className="mt-3 font-black text-[#29221b]">
                      No products found
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map(
                      (
                        product,
                      ) => (
                        <article
                          key={
                            product.id
                          }
                          className="overflow-hidden rounded-2xl border border-orange-100 bg-[#fffaf0]"
                        >
                          <div className="relative">
                            <img
                              src={
                                product.thumbnail
                              }
                              alt={
                                product.title
                              }
                              className="h-48 w-full object-cover"
                            />

                            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#d97706] shadow">
                              {
                                product.category
                              }
                            </span>
                          </div>

                          <div className="p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-[#a6957e]">
                              {
                                product.brand
                              }
                            </p>

                            <h3 className="mt-1 line-clamp-2 font-black text-[#29221b]">
                              {
                                product.title
                              }
                            </h3>

                            <div className="mt-3 flex items-center justify-between">
                              <p className="font-black text-[#d97706]">
                                {formatCurrency(
                                  product.price,
                                )}
                              </p>

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-black ${
                                  product.stock <=
                                  10
                                    ? "bg-red-100 text-red-600"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                Stock:{" "}
                                {
                                  product.stock
                                }
                              </span>
                            </div>

                            <div className="mt-4 flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditProduct(
                                    product,
                                  )
                                }
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-100 px-3 py-2.5 text-sm font-black text-[#7c3aed]"
                              >
                                <Edit3
                                  size={
                                    16
                                  }
                                />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setShowDeleteModal(
                                    product,
                                  )
                                }
                                className="flex items-center justify-center rounded-xl bg-red-100 px-3 py-2.5 text-red-600"
                                aria-label={`Delete ${product.title}`}
                              >
                                <Trash2
                                  size={
                                    16
                                  }
                                />
                              </button>
                            </div>
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================
              ORDERS
          =================================================== */}
          {activeTab ===
            "orders" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <h2 className="text-2xl font-black text-[#29221b]">
                    Order Management
                  </h2>

                  <p className="mt-1 text-sm text-[#8c7a63]">
                    All customer orders are visible here.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a6957e]"
                    />

                    <input
                      value={
                        orderSearch
                      }
                      onChange={(
                        event,
                      ) =>
                        setOrderSearch(
                          event.target.value,
                        )
                      }
                      placeholder="Search order ID or customer..."
                      className="w-full rounded-xl border border-orange-100 bg-[#fffaf0] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#f59e0b]"
                    />
                  </div>

                  <select
                    value={
                      orderStatusFilter
                    }
                    onChange={(
                      event,
                    ) =>
                      setOrderStatusFilter(
                        event.target.value as
                          | "all"
                          | OrderStatus,
                      )
                    }
                    className="rounded-xl border border-orange-100 bg-[#fffaf0] px-4 py-3 text-sm font-bold outline-none focus:border-[#f59e0b]"
                  >
                    <option value="all">
                      All Statuses
                    </option>

                    {orderStatuses.map(
                      (
                        status,
                      ) => (
                        <option
                          key={
                            status
                          }
                          value={
                            status
                          }
                        >
                          {
                            status
                          }
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="overflow-x-auto">
                  {filteredOrders.length ===
                  0 ? (
                    <div className="py-14 text-center">
                      <ShoppingBag
                        size={40}
                        className="mx-auto text-orange-300"
                      />

                      <p className="mt-3 font-black text-[#29221b]">
                        No orders found
                      </p>
                    </div>
                  ) : (
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-orange-100 text-xs uppercase tracking-wide text-[#8c7a63]">
                          <th className="px-3 py-3">
                            Order
                          </th>

                          <th className="px-3 py-3">
                            Customer
                          </th>

                          <th className="px-3 py-3">
                            Items
                          </th>

                          <th className="px-3 py-3">
                            Total
                          </th>

                          <th className="px-3 py-3">
                            Status
                          </th>

                          <th className="px-3 py-3">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredOrders.map(
                          (
                            order,
                          ) => (
                            <tr
                              key={
                                order.id
                              }
                              className="border-b border-orange-50"
                            >
                              <td className="px-3 py-4 font-black text-[#29221b]">
                                #{order.id}
                              </td>

                              <td className="px-3 py-4">
                                <p className="font-bold">
                                  {
                                    order
                                      .shippingAddress
                                      .fullName
                                  }
                                </p>

                                <p className="text-xs text-[#8c7a63]">
                                  {
                                    order
                                      .shippingAddress
                                      .email
                                  }
                                </p>
                              </td>

                              <td className="px-3 py-4">
                                {order.items.reduce(
                                  (
                                    sum,
                                    item,
                                  ) =>
                                    sum +
                                    item.quantity,
                                  0,
                                )}
                              </td>

                              <td className="px-3 py-4 font-black text-[#d97706]">
                                {formatCurrency(
                                  order.total,
                                )}
                              </td>

                              <td className="px-3 py-4">
                                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-[#7c3aed]">
                                  {
                                    order.status
                                  }
                                </span>
                              </td>

                              <td className="px-3 py-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedOrder(
                                      order,
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl bg-orange-100 px-3 py-2 text-xs font-black text-[#d97706]"
                                >
                                  <Eye
                                    size={
                                      15
                                    }
                                  />
                                  View
                                </button>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              CUSTOMERS
          =================================================== */}
          {activeTab ===
            "customers" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-2xl font-black text-[#29221b]">
                  Customers
                </h2>

                <p className="mt-1 text-sm text-[#8c7a63]">
                  Customers registered on this ShopSphere demo.
                </p>

                <div className="relative mt-6">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a6957e]"
                  />

                  <input
                    value={
                      customerSearch
                    }
                    onChange={(
                      event,
                    ) =>
                      setCustomerSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search customer name or email..."
                    className="w-full rounded-xl border border-purple-100 bg-[#fffaf0] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#8b5cf6]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCustomers.map(
                  (
                    customer,
                  ) => {
                    const customerOrders =
                      getCustomerOrders(
                        customer.email,
                      );

                    const spent =
                      customerOrders.reduce(
                        (
                          sum,
                          order,
                        ) =>
                          sum +
                          order.total,
                        0,
                      );

                    return (
                      <article
                        key={
                          customer.id
                        }
                        className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] text-lg font-black text-white">
                            {customer.name
                              .charAt(
                                0,
                              )
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-black text-[#29221b]">
                              {
                                customer.name
                              }
                            </h3>

                            <p className="truncate text-xs text-[#8c7a63]">
                              {
                                customer.email
                              }
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-purple-50 p-3">
                            <p className="text-[10px] font-black uppercase tracking-wide text-[#8b5cf6]">
                              Orders
                            </p>

                            <p className="mt-1 text-xl font-black text-[#29221b]">
                              {
                                customerOrders.length
                              }
                            </p>
                          </div>

                          <div className="rounded-2xl bg-orange-50 p-3">
                            <p className="text-[10px] font-black uppercase tracking-wide text-[#d97706]">
                              Spent
                            </p>

                            <p className="mt-1 text-xl font-black text-[#29221b]">
                              {formatCurrency(
                                spent,
                              )}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>

              {filteredCustomers.length ===
                0 && (
                <div className="rounded-3xl border border-dashed border-purple-200 bg-purple-50/40 px-6 py-14 text-center">
                  <Users
                    size={40}
                    className="mx-auto text-purple-300"
                  />

                  <p className="mt-3 font-black text-[#29221b]">
                    No customers found
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ==================================================
              ANALYTICS
          =================================================== */}
          {activeTab ===
            "analytics" && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#ec4899] p-6 text-white shadow-xl sm:p-8">
                <p className="text-sm font-bold text-white/75">
                  SHOPSPHERE AI
                </p>

                <h2 className="mt-1 text-3xl font-black">
                  Recommendation Analytics
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
                  Local demo analytics for recommendation impressions, clicks and conversions.
                  These metrics are simulated because this frontend has no backend analytics service.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8c7a63]">
                    Impressions
                  </p>

                  <p className="mt-2 text-3xl font-black text-[#29221b]">
                    {analytics.impressions.toLocaleString(
                      "en-IN",
                    )}
                  </p>
                </div>

                <div className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8c7a63]">
                    Clicks
                  </p>

                  <p className="mt-2 text-3xl font-black text-[#29221b]">
                    {analytics.clicks.toLocaleString(
                      "en-IN",
                    )}
                  </p>
                </div>

                <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8c7a63]">
                    CTR
                  </p>

                  <p className="mt-2 text-3xl font-black text-[#29221b]">
                    {analytics.ctr.toFixed(
                      1,
                    )}
                    %
                  </p>
                </div>

                <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8c7a63]">
                    Conversions
                  </p>

                  <p className="mt-2 text-3xl font-black text-[#29221b]">
                    {
                      analytics.conversions
                    }
                  </p>

                  <p className="mt-1 text-xs font-bold text-green-600">
                    {analytics.conversionRate.toFixed(
                      1,
                    )}
                    % conversion rate
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-[#8b5cf6]">
                    <BarChart3
                      size={21}
                    />
                  </div>

                  <div>
                    <h3 className="font-black text-[#29221b]">
                      Strategy Breakdown
                    </h3>

                    <p className="text-sm text-[#8c7a63]">
                      Nine recommendation strategies from the ShopSphere AI architecture.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {strategyNames.map(
                    (
                      strategy,
                      index,
                    ) => {
                      const share =
                        Math.max(
                          4,
                          18 -
                            index,
                          );

                      return (
                        <div
                          key={
                            strategy
                          }
                          className="rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-black text-[#29221b]">
                              {
                                strategy
                              }
                            </p>

                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-[#8b5cf6]">
                              {share}%
                            </span>
                          </div>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ec4899]"
                              style={{
                                width: `${share}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ==================================================
          PRODUCT MODAL
      =================================================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-orange-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-black text-[#29221b]">
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p className="mt-1 text-xs text-[#8c7a63]">
                  Changes are saved to the shared local catalogue.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowProductModal(
                    false,
                  )
                }
                className="rounded-full bg-orange-50 p-2 text-[#6b5b47]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <div className="sm:col-span-2">
                <label className="text-xs font-black uppercase tracking-wide text-[#6b5b47]">
                  Product Name *
                </label>

                <input
                  value={
                    productForm.title
                  }
                  onChange={(
                    event,
                  ) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        title:
                          event.target.value,
                      }),
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wide text-[#6b5b47]">
                  Brand *
                </label>

                <input
                  value={
                    productForm.brand
                  }
                  onChange={(
                    event,
                  ) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        brand:
                          event.target.value,
                      }),
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wide text-[#6b5b47]">
                  Category *
                </label>

                <select
                  value={
                    productForm.category
                  }
                  onChange={(
                    event,
                  ) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        category:
                          event.target.value,
                      }),
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-[#f59e0b]"
                >
                  {adminCategories.map(
                    (
                      category,
                    ) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wide text-[#6b5b47]">
                  Price *
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    productForm.price
                  }
                  onChange={(
                    event,
                  ) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        price:
                          Number(
                            event.target
                              .value,
                          ),
                      }),
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wide text-[#6b5b47]">
                  Stock *
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    productForm.stock
                  }
                  onChange={(
                    event,
                  ) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        stock:
                          Number(
                            event.target
                              .value,
                          ),
                      }),
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wide text-[#6b5b47]">
                  Discount %
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={
                    productForm.discountPercentage
                  }
                  onChange={(
                    event,
                  ) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        discountPercentage:
                          Number(
                            event.target
                              .value,
                          ),
                      }),
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wide text-[#6b5b47]">
                  Rating
                </label>

                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={
                    productForm.rating
                  }
                  onChange={(
                    event,
                  ) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        rating:
                          Number(
                            event.target
                              .value,
                          ),
                      }),
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-black uppercase tracking-wide text-[#6b5b47]">
                  Thumbnail URL *
                </label>

                <input
                  value={
                    productForm.thumbnail
                  }
                  onChange={(
                    event,
                  ) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        thumbnail:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="https://..."
                  className="mt-2 w-full rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-black uppercase tracking-wide text-[#6b5b47]">
                  Description *
                </label>

                <textarea
                  value={
                    productForm.description
                  }
                  onChange={(
                    event,
                  ) =>
                    setProductForm(
                      (current) => ({
                        ...current,
                        description:
                          event.target.value,
                      }),
                    )
                  }
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-[#f59e0b]"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wide text-[#6b5b47]">
                    Image URLs
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setProductForm(
                        (current) => ({
                          ...current,
                          images: [
                            ...current.images,
                            "",
                          ],
                        }),
                      )
                    }
                    className="text-xs font-black text-[#8b5cf6]"
                  >
                    + Add Image
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {productForm.images.map(
                    (
                      image,
                      index,
                    ) => (
                      <input
                        key={
                          index
                        }
                        value={
                          image
                        }
                        onChange={(
                          event,
                        ) =>
                          setProductForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              images:
                                current.images.map(
                                  (
                                    currentImage,
                                    currentIndex,
                                  ) =>
                                    currentIndex ===
                                    index
                                      ? event
                                          .target
                                          .value
                                      : currentImage,
                                ),
                            }),
                          )
                        }
                        placeholder={`Image URL ${index + 1}`}
                        className="w-full rounded-xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-[#f59e0b]"
                      />
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-orange-100 p-5 sm:flex-row sm:justify-end sm:p-6">
              <button
                type="button"
                onClick={() =>
                  setShowProductModal(
                    false,
                  )
                }
                className="rounded-xl border border-orange-100 px-5 py-3 text-sm font-black text-[#6b5b47]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveProduct
                }
                className="rounded-xl bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] px-5 py-3 text-sm font-black text-white shadow-lg"
              >
                {editingProduct
                  ? "Save Changes"
                  : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          DELETE MODAL
      =================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2
                size={24}
              />
            </div>

            <h2 className="mt-5 text-xl font-black text-[#29221b]">
              Delete Product?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6b5b47]">
              Are you sure you want to delete{" "}
              <span className="font-black">
                {
                  showDeleteModal.title
                }
              </span>
              ?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowDeleteModal(
                    null,
                  )
                }
                className="rounded-xl border border-orange-100 px-5 py-3 text-sm font-black text-[#6b5b47]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDeleteProduct(
                    showDeleteModal,
                  )
                }
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          ORDER DETAILS MODAL
      =================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-orange-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#8b5cf6]">
                  Order Details
                </p>

                <h2 className="mt-1 text-xl font-black text-[#29221b]">
                  #{selectedOrder.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(
                    null,
                  )
                }
                className="rounded-full bg-orange-50 p-2 text-[#6b5b47]"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {/* Customer */}
              <div className="rounded-2xl bg-purple-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-[#8b5cf6]">
                  Customer
                </p>

                <p className="mt-1 font-black text-[#29221b]">
                  {
                    selectedOrder
                      .shippingAddress
                      .fullName
                  }
                </p>

                <p className="mt-1 text-sm text-[#6b5b47]">
                  {
                    selectedOrder
                      .shippingAddress
                      .email
                  }
                </p>

                <p className="text-sm text-[#6b5b47]">
                  {
                    selectedOrder
                      .shippingAddress
                      .phone
                  }
                </p>
              </div>

              {/* Address */}
              <div className="rounded-2xl bg-orange-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-[#d97706]">
                  Delivery Address
                </p>

                <p className="mt-1 text-sm leading-6 text-[#6b5b47]">
                  {
                    selectedOrder
                      .shippingAddress
                      .address
                  }
                  <br />
                  {
                    selectedOrder
                      .shippingAddress
                      .city
                  }
                  ,{" "}
                  {
                    selectedOrder
                      .shippingAddress
                      .state
                  }
                  <br />
                  {
                    selectedOrder
                      .shippingAddress
                      .pincode
                  }
                </p>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-black text-[#29221b]">
                  Line Items
                </h3>

                <div className="mt-3 space-y-3">
                  {selectedOrder.items.map(
                    (
                      item,
                    ) => (
                      <div
                        key={
                          item.product.id
                        }
                        className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-[#fffaf0] p-3"
                      >
                        <img
                          src={
                            item.product
                              .thumbnail
                          }
                          alt={
                            item.product
                              .title
                          }
                          className="h-16 w-16 rounded-xl object-cover"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 font-black text-[#29221b]">
                            {
                              item
                                .product
                                .title
                            }
                          </p>

                          <p className="mt-1 text-xs text-[#8c7a63]">
                            Qty:{" "}
                            {
                              item.quantity
                            }
                          </p>
                        </div>

                        <p className="font-black text-[#d97706]">
                          {formatCurrency(
                            item.price *
                              item.quantity,
                          )}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-2xl border border-orange-100 bg-white p-4">
                <div className="flex justify-between py-1 text-sm text-[#6b5b47]">
                  <span>
                    Subtotal
                  </span>

                  <span className="font-bold">
                    {formatCurrency(
                      selectedOrder.subtotal,
                    )}
                  </span>
                </div>

                <div className="flex justify-between py-1 text-sm text-[#6b5b47]">
                  <span>
                    Delivery
                  </span>

                  <span className="font-bold">
                    {formatCurrency(
                      selectedOrder.delivery,
                    )}
                  </span>
                </div>

                <div className="mt-2 flex justify-between border-t border-orange-100 pt-3">
                  <span className="font-black text-[#29221b]">
                    Total
                  </span>

                  <span className="text-lg font-black text-[#d97706]">
                    {formatCurrency(
                      selectedOrder.total,
                    )}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-[#8b5cf6]">
                      Current Status
                    </p>

                    <p className="mt-1 text-lg font-black text-[#29221b]">
                      {
                        selectedOrder.status
                      }
                    </p>
                  </div>

                  {selectedOrder.status !==
                    "Delivered" &&
                    selectedOrder.status !==
                      "Cancelled" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleAdvanceOrder(
                            selectedOrder,
                          )
                        }
                        className="rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] px-5 py-3 text-sm font-black text-white shadow-lg"
                      >
                        Advance Status
                      </button>
                    )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {orderStatuses
                    .filter(
                      (status) =>
                        status !==
                        "Cancelled",
                    )
                    .map(
                      (
                        status,
                      ) => (
                        <span
                          key={
                            status
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-black ${
                            status ===
                            selectedOrder.status
                              ? "bg-[#8b5cf6] text-white"
                              : "bg-white text-[#8c7a63]"
                          }`}
                        >
                          {
                            status
                          }
                        </span>
                      ),
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Admin;