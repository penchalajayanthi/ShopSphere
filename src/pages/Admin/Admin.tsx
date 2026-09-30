import {
  BarChart3,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Edit3,
  Eye,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "react-router-dom";
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

  const users = useAuthStore(
    (state) => state.users,
  );

  const [orders, setOrders] = useState<Order[]>(
    () =>
      storage.get<Order[]>(
        ORDERS_KEY,
        [],
      ),
  );

  const [adminCategories, setAdminCategories] =
    useState<AdminCategory[]>(() =>
      storage.get<AdminCategory[]>(
        CATEGORIES_KEY,
        initialCategories,
      ),
    );

  const [activeTab, setActiveTab] =
    useState<Tab>("overview");

  const [searchParams] =
    useSearchParams();

  useEffect(() => {
    const requestedTab =
      searchParams.get("tab");

    const validTabs: Tab[] = [
      "overview",
      "products",
      "orders",
      "customers",
      "analytics",
    ];

    if (
      requestedTab &&
      validTabs.includes(
        requestedTab as Tab,
      )
    ) {
      setActiveTab(
        requestedTab as Tab,
      );
    }
  }, [searchParams]);

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

  const [showCategoryModal, setShowCategoryModal] =
    useState(false);

  const [newCategoryName, setNewCategoryName] =
    useState("");

  const [toast, setToast] =
    useState("");

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

  const customers = useMemo(() => {
    return users.filter(
      (user) => user.role !== "admin",
    );
  }, [users]);

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
  }, [
    orders.length,
    totalRevenue,
  ]);


  const topProducts = useMemo(() => {
    const salesMap = new Map<
      number,
      number
    >();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const current =
          salesMap.get(
            item.product.id,
          ) ?? 0;

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
  }, [
    orders,
    products,
  ]);

  const filteredProducts = useMemo(() => {
    const term =
      productSearch
        .trim()
        .toLowerCase();

    return products.filter(
      (product) => {
        const categoryName =
          adminCategories.find(
            (category) =>
              category.id ===
              product.category,
          )?.name
            .toLowerCase() ?? "";

        const matchesSearch =
          !term ||
          product.title
            .toLowerCase()
            .includes(term) ||
          product.brand
            .toLowerCase()
            .includes(term) ||
          product.category
            .toLowerCase()
            .includes(term) ||
          categoryName.includes(term);

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
    adminCategories,
  ]);

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

  
  const changeTab = (tab: Tab) => {
    setActiveTab(tab);

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
   * CATEGORY NAME
   * ---------------------------------------------------
   */
  const getCategoryName = (
    categoryId: string,
  ) => {
    return (
      adminCategories.find(
        (category) =>
          category.id === categoryId,
      )?.name ?? categoryId
    );
  };

  /*
   * ---------------------------------------------------
   * PRODUCT PREVIEW
   * ---------------------------------------------------
   */
  const previewImage =
    productForm.thumbnail.trim() ||
    productForm.images.find(
      (image) => image.trim(),
    ) ||
    "";

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
      images: [""],
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
          ? [...product.images]
          : [product.thumbnail],
    });

    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm(
      emptyProductForm,
    );
  };


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

    const cleanedImages =
      productForm.images
        .map((image) =>
          image.trim(),
        )
        .filter(Boolean);

    const cleanedProduct: Product = {
      ...productForm,

      title:
        productForm.title.trim(),

      brand:
        productForm.brand.trim(),

      description:
        productForm.description.trim(),

      thumbnail:
        productForm.thumbnail.trim(),

      images:
        cleanedImages.length > 0
          ? cleanedImages
          : [productForm.thumbnail.trim()],

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
      updateProduct(
        cleanedProduct,
      );

      showToast(
        "Product updated successfully.",
      );
    } else {
      addProduct(
        cleanedProduct,
      );

      showToast(
        "Product added successfully.",
      );
    }

    closeProductModal();
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

    deleteProduct(
      product.id,
    );

    showToast(
      "Product deleted successfully.",
    );

    setShowDeleteModal(null);
  };

  /*
   * ---------------------------------------------------
   * OPEN CATEGORY MODAL
   * ---------------------------------------------------
   */
  const handleAddCategory = () => {
    setNewCategoryName("");
    setShowCategoryModal(true);
  };

  /*
   * ---------------------------------------------------
   * CLOSE CATEGORY MODAL
   * ---------------------------------------------------
   */
  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setNewCategoryName("");
  };

  /*
   * ---------------------------------------------------
   * CREATE CATEGORY
   * ---------------------------------------------------
   */
  const handleCreateCategory = () => {
    const cleanName =
      newCategoryName.trim();

    if (!cleanName) {
      showToast(
        "Please enter a category name.",
      );
      return;
    }

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
        .replace(
          /[^a-z0-9]+/g,
          "-",
        )
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

    setAdminCategories(
      updated,
    );

    storage.set(
      CATEGORIES_KEY,
      updated,
    );

    setProductCategory(id);

    closeCategoryModal();

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
   * ANALYTICS
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
   * HEADER NAVIGATION
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
      ================================================== */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-5 z-[11000] max-w-sm rounded-2xl border border-green-100 bg-white px-5 py-4 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle2
                size={19}
                className="text-green-600"
              />
            </div>

            <p className="text-sm font-bold text-[#29221b]">
              {toast}
            </p>
          </div>
        </div>
      )}

      {/* =========================================================
          ADMIN SECONDARY NAVIGATION
          Hidden on mobile only. Visible on tablet, laptop, desktop.
          Mobile navigation is handled by the main blue Header.tsx.
      ========================================================= */}
      <header className="sticky top-16 z-[9990] hidden overflow-hidden bg-gradient-to-br from-[#2f1650] via-[#6d267f] to-[#d85b3d] text-white shadow-xl sm:block">

        {/* Decorative background circles */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#f59e0b]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#ec4899]/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-5 h-40 w-40 rounded-full bg-[#8b5cf6]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">

          <nav
            aria-label="Admin navigation"
            className="border-t border-white/10"
          >

            <div className="py-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">

                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => changeTab(tab.id)}
                      className={`group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-black transition-all duration-200 ${
                        active
                          ? "border-white/20 bg-white text-[#6d267f] shadow-lg"
                          : "border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon
                        size={17}
                        className={
                          active
                            ? "text-[#ec4899]"
                            : "text-yellow-300"
                        }
                      />

                      <span>{tab.label}</span>
                    </button>
                  );
                })}

              </div>
            </div>

          </nav>

        </div>
      </header>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8 lg:py-8">

        {/* ==================================================
            OVERVIEW
        ================================================== */}
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
                        {
                          products.length
                        }
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
                        {
                          customers.length
                        }
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

              {/* Secondary Metrics */}
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
                    {
                      lowStockProducts.length
                    }
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
                          .slice(
                            0,
                            6,
                          )
                          .map(
                            (
                              order,
                            ) => (
                              <tr
                                key={
                                  order.id
                                }
                                className="border-b border-orange-50 last:border-0"
                              >

                                <td className="px-3 py-4 font-black text-[#29221b]">
                                  #
                                  {
                                    order.id
                                  }
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
                            ),
                          )}

                      </tbody>
                    </table>
                  )}

                </div>
              </div>

              {/* Inventory Alerts */}
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
                            {
                              product.stock
                            }{" "}
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
                            units ordered
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
        ================================================== */}
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
                    className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ec4899] px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
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
                      className="w-full rounded-xl border border-orange-100 bg-[#fffaf0] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
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
                    className="rounded-xl border border-orange-100 bg-[#fffaf0] px-4 py-3 text-sm font-bold outline-none focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
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
                            category.icon
                          }{" "}
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
                    (
                      category,
                    ) => (
                      <span
                        key={
                          category.id
                        }
                        className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-[#d97706]"
                      >
                        {
                          category.icon
                        }{" "}
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
                    className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 text-xs font-black text-[#8b5cf6] transition hover:from-purple-200 hover:to-pink-200"
                  >
                    <Plus
                      size={13}
                    />
                    Add Category
                  </button>

                </div>
              </div>

              <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">

                <div className="mb-5 flex items-center justify-between">

                  <div>
                    <p className="text-sm font-black text-[#29221b]">
                      {
                        filteredProducts.length
                      }{" "}
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
                                getCategoryName(
                                  product.category,
                                )
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
                                className={`rounded-full px-2.5 py-1 text-xs font-black ${product.stock <=
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
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-100 px-3 py-2.5 text-sm font-black text-[#7c3aed] transition hover:bg-purple-200"
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
                                className="flex items-center justify-center rounded-xl bg-red-100 px-3 py-2.5 text-red-600 transition hover:bg-red-200"
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
        ================================================== */}
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
                      className="w-full rounded-xl border border-orange-100 bg-[#fffaf0] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
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
                    className="rounded-xl border border-orange-100 bg-[#fffaf0] px-4 py-3 text-sm font-bold outline-none focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
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
                                #
                                {
                                  order.id
                                }
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
        ================================================== */}
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
                    className="w-full rounded-xl border border-purple-100 bg-[#fffaf0] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-purple-100"
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
        ================================================== */}
        {activeTab ===
          "analytics" && (
            <div className="space-y-6">

              <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#4c1d95] via-[#8b5cf6] to-[#ec4899] p-6 text-white shadow-xl sm:p-8">

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

      </div>

      {/* ==================================================
          PRODUCT MODAL
      ================================================== */}
      {showProductModal && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#29221b]/70 p-3 backdrop-blur-sm sm:p-5"
          role="presentation"
        >

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
          >

            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-orange-100 bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 px-5 py-4 sm:px-7">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] text-white shadow-md">

                  {editingProduct ? (
                    <Edit3 size={20} />
                  ) : (
                    <Plus size={21} />
                  )}

                </div>

                <div className="min-w-0">

                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8b5cf6]">
                    {editingProduct
                      ? "Product Management"
                      : "New Catalogue Item"}
                  </p>

                  <h2
                    id="product-modal-title"
                    className="truncate text-xl font-black text-[#29221b] sm:text-2xl"
                  >
                    {editingProduct
                      ? "Edit Product"
                      : "Add Product"}
                  </h2>

                  {editingProduct && (
                    <p className="mt-0.5 text-xs text-[#8c7a63]">
                      Product ID #
                      {
                        productForm.id
                      }
                    </p>
                  )}

                </div>

              </div>

              <button
                type="button"
                onClick={
                  closeProductModal
                }
                className="rounded-xl bg-white p-2.5 text-[#6b5b47] shadow-sm transition hover:bg-orange-100 hover:text-[#d97706]"
                aria-label="Close product modal"
              >
                <X size={20} />
              </button>

            </div>

            {/* Modal Body */}
            <div className="min-h-0 flex-1 overflow-y-auto">

              <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-7">

                {/* LEFT FORM */}
                <div className="space-y-6">

                  {/* Basic Information */}
                  <section className="rounded-2xl border border-orange-100 bg-[#fffaf5] p-5">

                    <div className="mb-5">

                      <h3 className="text-lg font-black text-[#29221b]">
                        Basic Information
                      </h3>

                      <p className="mt-1 text-xs text-[#8c7a63]">
                        Enter the main information customers will see.
                      </p>

                    </div>

                    <div className="space-y-4">

                      <div>

                        <label
                          htmlFor="admin-product-title"
                          className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6b5b47]"
                        >
                          Product Name *
                        </label>

                        <input
                          id="admin-product-title"
                          value={
                            productForm.title
                          }
                          onChange={(
                            event,
                          ) =>
                            setProductForm(
                              (
                                current,
                              ) => ({
                                ...current,
                                title:
                                  event
                                    .target
                                    .value,
                              }),
                            )
                          }
                          placeholder="Enter product name"
                          className="w-full rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-medium text-[#29221b] outline-none transition placeholder:text-[#b8a792] focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
                        />

                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">

                        <div>

                          <label
                            htmlFor="admin-product-brand"
                            className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6b5b47]"
                          >
                            Brand *
                          </label>

                          <input
                            id="admin-product-brand"
                            value={
                              productForm.brand
                            }
                            onChange={(
                              event,
                            ) =>
                              setProductForm(
                                (
                                  current,
                                ) => ({
                                  ...current,
                                  brand:
                                    event
                                      .target
                                      .value,
                                }),
                              )
                            }
                            placeholder="Enter brand"
                            className="w-full rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-medium text-[#29221b] outline-none transition placeholder:text-[#b8a792] focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
                          />

                        </div>

                        <div>

                          <label
                            htmlFor="admin-product-category"
                            className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6b5b47]"
                          >
                            Category *
                          </label>

                          <select
                            id="admin-product-category"
                            value={
                              productForm.category
                            }
                            onChange={(
                              event,
                            ) =>
                              setProductForm(
                                (
                                  current,
                                ) => ({
                                  ...current,
                                  category:
                                    event
                                      .target
                                      .value,
                                }),
                              )
                            }
                            className="w-full rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-bold text-[#29221b] outline-none transition focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
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
                                    category.icon
                                  }{" "}
                                  {
                                    category.name
                                  }
                                </option>
                              ),
                            )}

                          </select>

                        </div>

                      </div>

                      <div>

                        <label
                          htmlFor="admin-product-description"
                          className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6b5b47]"
                        >
                          Description *
                        </label>

                        <textarea
                          id="admin-product-description"
                          value={
                            productForm.description
                          }
                          onChange={(
                            event,
                          ) =>
                            setProductForm(
                              (
                                current,
                              ) => ({
                                ...current,
                                description:
                                  event
                                    .target
                                    .value,
                              }),
                            )
                          }
                          rows={5}
                          placeholder="Describe the product..."
                          className="w-full resize-none rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-medium leading-6 text-[#29221b] outline-none transition placeholder:text-[#b8a792] focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
                        />

                      </div>

                    </div>
                  </section>

                  {/* Pricing */}
                  <section className="rounded-2xl border border-purple-100 bg-[#fbf8ff] p-5">

                    <div className="mb-5">

                      <h3 className="text-lg font-black text-[#29221b]">
                        Pricing & Inventory
                      </h3>

                      <p className="mt-1 text-xs text-[#8c7a63]">
                        Configure product price, stock and rating.
                      </p>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                      <div>

                        <label
                          htmlFor="admin-product-price"
                          className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6b5b47]"
                        >
                          Price *
                        </label>

                        <div className="relative">

                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#d97706]">
                            ₹
                          </span>

                          <input
                            id="admin-product-price"
                            type="number"
                            min="0"
                            value={
                              productForm.price
                            }
                            onChange={(
                              event,
                            ) =>
                              setProductForm(
                                (
                                  current,
                                ) => ({
                                  ...current,
                                  price:
                                    Number(
                                      event
                                        .target
                                        .value,
                                    ),
                                }),
                              )
                            }
                            className="w-full rounded-xl border border-orange-100 bg-white py-3 pl-9 pr-4 text-sm font-bold text-[#29221b] outline-none transition focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
                          />

                        </div>

                      </div>

                      <div>

                        <label
                          htmlFor="admin-product-stock"
                          className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6b5b47]"
                        >
                          Stock *
                        </label>

                        <input
                          id="admin-product-stock"
                          type="number"
                          min="0"
                          value={
                            productForm.stock
                          }
                          onChange={(
                            event,
                          ) =>
                            setProductForm(
                              (
                                current,
                              ) => ({
                                ...current,
                                stock:
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                              }),
                            )
                          }
                          className="w-full rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-bold text-[#29221b] outline-none transition focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
                        />

                      </div>

                      <div>

                        <label
                          htmlFor="admin-product-discount"
                          className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6b5b47]"
                        >
                          Discount
                        </label>

                        <div className="relative">

                          <input
                            id="admin-product-discount"
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
                                (
                                  current,
                                ) => ({
                                  ...current,
                                  discountPercentage:
                                    Number(
                                      event
                                        .target
                                        .value,
                                    ),
                                }),
                              )
                            }
                            className="w-full rounded-xl border border-orange-100 bg-white px-4 py-3 pr-10 text-sm font-bold text-[#29221b] outline-none transition focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
                          />

                          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-[#8c7a63]">
                            %
                          </span>

                        </div>
                      </div>

                      <div>

                        <label
                          htmlFor="admin-product-rating"
                          className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6b5b47]"
                        >
                          Rating
                        </label>

                        <div className="relative">

                          <input
                            id="admin-product-rating"
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
                                (
                                  current,
                                ) => ({
                                  ...current,
                                  rating:
                                    Number(
                                      event
                                        .target
                                        .value,
                                    ),
                                }),
                              )
                            }
                            className="w-full rounded-xl border border-orange-100 bg-white px-4 py-3 pr-10 text-sm font-bold text-[#29221b] outline-none transition focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
                          />

                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#f59e0b]">
                            ★
                          </span>

                        </div>
                      </div>

                    </div>
                  </section>

                  {/* Images */}
                  <section className="rounded-2xl border border-pink-100 bg-[#fff8fc] p-5">

                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <h3 className="text-lg font-black text-[#29221b]">
                          Product Images
                        </h3>

                        <p className="mt-1 text-xs text-[#8c7a63]">
                          Add the main image and additional product images.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setProductForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              images: [
                                ...current.images,
                                "",
                              ],
                            }),
                          )
                        }
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-purple-100 px-4 py-2.5 text-xs font-black text-[#7c3aed] transition hover:bg-purple-200"
                      >
                        <Plus size={15} />
                        Add Image
                      </button>

                    </div>

                    <div>

                      <label
                        htmlFor="admin-product-thumbnail"
                        className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6b5b47]"
                      >
                        Thumbnail URL *
                      </label>

                      <input
                        id="admin-product-thumbnail"
                        value={
                          productForm.thumbnail
                        }
                        onChange={(
                          event,
                        ) =>
                          setProductForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              thumbnail:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        placeholder="https://example.com/product-image.jpg"
                        className="w-full rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-medium text-[#29221b] outline-none transition placeholder:text-[#b8a792] focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
                      />

                    </div>

                    <div className="mt-5">

                      <div className="mb-3 flex items-center justify-between">

                        <p className="text-xs font-black uppercase tracking-wide text-[#6b5b47]">
                          Additional Images
                        </p>

                        <span className="text-[11px] font-bold text-[#a6957e]">
                          {
                            productForm.images.length
                          }{" "}
                          image
                          {
                            productForm.images.length ===
                              1
                              ? ""
                              : "s"
                          }
                        </span>

                      </div>

                      <div className="space-y-3">

                        {productForm.images.map(
                          (
                            image,
                            index,
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="flex gap-2"
                            >

                              <input
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
                                placeholder={`Additional image URL ${index + 1}`}
                                className="min-w-0 flex-1 rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#b8a792] focus:border-[#f59e0b] focus:ring-4 focus:ring-orange-100"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  setProductForm(
                                    (
                                      current,
                                    ) => ({
                                      ...current,
                                      images:
                                        current.images.filter(
                                          (
                                            _,
                                            currentIndex,
                                          ) =>
                                            currentIndex !==
                                            index,
                                        ),
                                    }),
                                  )
                                }
                                className="shrink-0 rounded-xl bg-red-50 px-3 text-red-600 transition hover:bg-red-100"
                                aria-label={`Remove image ${index + 1}`}
                              >
                                <Trash2
                                  size={
                                    17
                                  }
                                />
                              </button>

                            </div>
                          ),
                        )}

                      </div>
                    </div>
                  </section>

                </div>

                {/* LIVE PREVIEW */}
                <div className="lg:sticky lg:top-0 lg:self-start">

                  <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">

                    <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 p-5">

                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8b5cf6]">
                        LIVE PREVIEW
                      </p>

                      <h3 className="mt-1 text-lg font-black text-[#29221b]">
                        Customer Product Card
                      </h3>

                    </div>

                    <div className="bg-[#fffaf0] p-5">

                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white ring-1 ring-orange-100">

                        {previewImage ? (
                          <img
                            src={
                              previewImage
                            }
                            alt={
                              productForm.title ||
                              "Product preview"
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center px-6 text-center">

                            <Package
                              size={48}
                              className="text-orange-200"
                            />

                            <p className="mt-3 text-sm font-bold text-[#a6957e]">
                              Product image preview
                            </p>

                            <p className="mt-1 text-xs text-[#b8a792]">
                              Add a thumbnail URL to preview the image.
                            </p>

                          </div>
                        )}

                        {productForm.discountPercentage >
                          0 && (
                            <span className="absolute left-3 top-3 rounded-full bg-[#ec4899] px-3 py-1 text-xs font-black text-white shadow-md">
                              -
                              {
                                productForm.discountPercentage
                              }
                              %
                            </span>
                          )}

                      </div>

                      <div className="mt-5">

                        <p className="text-xs font-black uppercase tracking-wide text-[#8c7a63]">
                          {
                            productForm.brand ||
                            "Brand name"
                          }
                        </p>

                        <h4 className="mt-1 line-clamp-2 text-xl font-black text-[#29221b]">
                          {
                            productForm.title ||
                            "Your product name"
                          }
                        </h4>

                        <div className="mt-3 flex flex-wrap items-center gap-2">

                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-[#d97706]">
                            ★{" "}
                            {Number(
                              productForm.rating,
                            ).toFixed(
                              1,
                            )}
                          </span>

                          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-[#7c3aed]">
                            {getCategoryName(
                              productForm.category,
                            )}
                          </span>

                        </div>

                        <p className="mt-4 line-clamp-3 text-xs leading-5 text-[#8c7a63]">
                          {
                            productForm.description ||
                            "Your product description will appear here."
                          }
                        </p>

                        <div className="mt-5 flex items-end justify-between gap-3">

                          <div>

                            <p className="text-2xl font-black text-[#d97706]">
                              {formatCurrency(
                                Number(
                                  productForm.price,
                                ) || 0,
                              )}
                            </p>

                            {Number(
                              productForm.discountPercentage,
                            ) > 0 && (
                                <p className="mt-1 text-xs font-bold text-[#a6957e]">
                                  Discount applied
                                </p>
                              )}

                          </div>

                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-black ${Number(
                              productForm.stock,
                            ) <=
                                10
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-700"
                              }`}
                          >
                            {
                              productForm.stock
                            }{" "}
                            in stock
                          </span>

                        </div>

                      </div>
                    </div>

                    <div className="border-t border-orange-100 bg-white p-5">

                      <div className="rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 p-4">

                        <p className="text-xs font-black text-[#7c3aed]">
                          💡 Product Preview
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#6b5b47]">
                          This preview updates automatically while you edit the product.
                        </p>

                      </div>

                    </div>

                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 border-t border-orange-100 bg-white px-5 py-4 sm:px-7">

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-xs text-[#8c7a63]">
                  * Required fields
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={
                      closeProductModal
                    }
                    className="rounded-xl border border-orange-100 bg-white px-5 py-3 text-sm font-black text-[#6b5b47] transition hover:bg-orange-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleSaveProduct
                    }
                    className="rounded-xl bg-gradient-to-r from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    {editingProduct
                      ? "Save Changes"
                      : "Add Product"}
                  </button>

                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ==================================================
          ADD CATEGORY MODAL
      ================================================== */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#29221b]/70 p-4 backdrop-blur-sm"
          role="presentation"
        >

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl"
          >

            {/* Category Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#4c1d95] via-[#8b5cf6] to-[#ec4899] px-6 py-6 text-white">

              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-lg backdrop-blur">
                    🛍️
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                      Catalogue
                    </p>

                    <h2
                      id="category-modal-title"
                      className="mt-1 text-xl font-black"
                    >
                      Add New Category
                    </h2>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    closeCategoryModal
                  }
                  className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
                  aria-label="Close category modal"
                >
                  <X size={19} />
                </button>

              </div>

            </div>

            {/* Category Modal Body */}
            <div className="p-6">

              <p className="text-sm leading-6 text-[#6b5b47]">
                Create a new category for the ShopSphere product catalogue.
              </p>

              <div className="mt-5">

                <label
                  htmlFor="new-category-name"
                  className="mb-2 block text-xs font-black uppercase tracking-wide text-[#6b5b47]"
                >
                  Category Name
                </label>

                <input
                  id="new-category-name"
                  autoFocus
                  value={
                    newCategoryName
                  }
                  onChange={(
                    event,
                  ) =>
                    setNewCategoryName(
                      event.target.value,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();
                      handleCreateCategory();
                    }

                    if (
                      event.key ===
                      "Escape"
                    ) {
                      closeCategoryModal();
                    }
                  }}
                  placeholder="e.g. Furniture"
                  className="w-full rounded-xl border border-orange-100 bg-[#fffaf5] px-4 py-3.5 text-sm font-bold text-[#29221b] outline-none transition placeholder:text-[#b8a792] focus:border-[#8b5cf6] focus:ring-4 focus:ring-purple-100"
                />

                <p className="mt-2 text-xs text-[#a6957e]">
                  Press Enter to create the category.
                </p>

              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 p-4">

                <p className="text-xs font-black text-[#7c3aed]">
                  ✨ New category
                </p>

                <p className="mt-1 text-sm font-bold text-[#6b5b47]">
                  {newCategoryName.trim() ||
                    "Your category name will appear here"}
                </p>

              </div>

            </div>

            {/* Category Modal Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-orange-100 bg-[#fffaf5] p-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={
                  closeCategoryModal
                }
                className="rounded-xl border border-orange-100 bg-white px-5 py-3 text-sm font-black text-[#6b5b47] transition hover:bg-orange-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleCreateCategory
                }
                className="rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus size={17} />
                  Create Category
                </span>
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ==================================================
          DELETE MODAL
      ================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#29221b]/70 p-4 backdrop-blur-sm">

          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >

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
                className="rounded-xl border border-orange-100 px-5 py-3 text-sm font-black text-[#6b5b47] transition hover:bg-orange-50"
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
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
              >
                Delete
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          ORDER DETAILS MODAL
      ================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#29221b]/70 p-4 backdrop-blur-sm">

          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-orange-100 bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 px-5 py-4 sm:px-6">

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
                className="rounded-xl bg-white p-2 text-[#6b5b47] shadow-sm transition hover:bg-orange-100"
                aria-label="Close order details"
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
                          className={`rounded-full px-3 py-1.5 text-xs font-black ${status ===
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
