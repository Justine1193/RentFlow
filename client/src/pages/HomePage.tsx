import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  FileText,
  Users,
  DollarSign,
  Wrench,
  BarChart3,
  Settings,
  Plus,
  DoorOpen,
  MapPin,
  Trash2,
  LogOut,
  Loader2,
  AlertCircle,
  X,
  Layers,
  CheckCircle2,
  Search,
  Menu,
} from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import { propertyApi, unitApi } from "../lib/api";
import type { Property, Unit, UnitStatus } from "../lib/api";
import logoOnlyImg from "../assets/logo only.png";

type NavTab =
  | "properties"
  | "leases"
  | "tenants"
  | "financials"
  | "maintenance"
  | "reports"
  | "settings";

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: "properties", label: "Properties", icon: Building2 },
  { id: "leases", label: "Leases", icon: FileText },
  { id: "tenants", label: "Tenants", icon: Users },
  { id: "financials", label: "Financials", icon: DollarSign },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function HomePage() {
  const { user, logout } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>("properties");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Properties & Units State
  const [properties, setProperties] = useState<Property[]>([]);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [selectedPropertyForUnits, setSelectedPropertyForUnits] = useState<Property | null>(null);
  const [propertyUnits, setPropertyUnits] = useState<Unit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

  // Add Property Form State
  const [propName, setPropName] = useState("");
  const [propAddress, setPropAddress] = useState("");
  const [propFormError, setPropFormError] = useState("");
  const [isSubmittingProp, setIsSubmittingProp] = useState(false);

  // Add Unit Form State
  const [unitNumber, setUnitNumber] = useState("");
  const [unitRent, setUnitRent] = useState("");
  const [unitStatus, setUnitStatus] = useState<UnitStatus>("VACANT");
  const [unitFormError, setUnitFormError] = useState("");
  const [isSubmittingUnit, setIsSubmittingUnit] = useState(false);

  // Fetch Dashboard Data
  const loadDashboardData = useCallback(async () => {
    try {
      setError("");
      const [propsRes, unitsRes] = await Promise.all([
        propertyApi.list(),
        unitApi.list(),
      ]);
      setProperties(propsRes.properties || []);
      setAllUnits(unitsRes.units || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load properties.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Open Units Modal & Load its Units
  async function handleOpenUnits(property: Property) {
    setSelectedPropertyForUnits(property);
    setIsLoadingUnits(true);
    setUnitFormError("");
    try {
      const res = await unitApi.list(property.id);
      setPropertyUnits(res.units || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingUnits(false);
    }
  }

  // Create Property Handler
  async function handleCreateProperty(e: React.FormEvent) {
    e.preventDefault();
    if (!propName.trim() || !propAddress.trim()) {
      setPropFormError("Please provide both property name and address.");
      return;
    }

    setIsSubmittingProp(true);
    setPropFormError("");
    try {
      await propertyApi.create({
        name: propName.trim(),
        address: propAddress.trim(),
      });
      setPropName("");
      setPropAddress("");
      setIsAddPropertyOpen(false);
      await loadDashboardData();
    } catch (err) {
      setPropFormError(err instanceof Error ? err.message : "Failed to create property.");
    } finally {
      setIsSubmittingProp(false);
    }
  }

  // Delete Property Handler
  async function handleDeleteProperty(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to delete "${name}"? All its units will also be deleted.`)) {
      return;
    }
    try {
      await propertyApi.delete(id);
      await loadDashboardData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete property.");
    }
  }

  // Create Unit Handler
  async function handleCreateUnit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPropertyForUnits) return;

    if (!unitNumber.trim() || !unitRent) {
      setUnitFormError("Unit number and rent amount are required.");
      return;
    }

    const rentNum = parseFloat(unitRent);
    if (isNaN(rentNum) || rentNum <= 0) {
      setUnitFormError("Rent amount must be a valid positive number.");
      return;
    }

    setIsSubmittingUnit(true);
    setUnitFormError("");
    try {
      await unitApi.create({
        propertyId: selectedPropertyForUnits.id,
        unitNumber: unitNumber.trim(),
        rentAmount: rentNum,
        status: unitStatus,
      });
      setUnitNumber("");
      setUnitRent("");
      setUnitStatus("VACANT");

      // Reload units for modal and refresh global stats
      const res = await unitApi.list(selectedPropertyForUnits.id);
      setPropertyUnits(res.units || []);
      await loadDashboardData();
    } catch (err) {
      setUnitFormError(err instanceof Error ? err.message : "Failed to create unit.");
    } finally {
      setIsSubmittingUnit(false);
    }
  }

  // Delete Unit Handler
  async function handleDeleteUnit(unitId: string) {
    if (!selectedPropertyForUnits) return;
    if (!window.confirm("Are you sure you want to delete this unit?")) return;

    try {
      await unitApi.delete(unitId);
      const res = await unitApi.list(selectedPropertyForUnits.id);
      setPropertyUnits(res.units || []);
      await loadDashboardData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete unit.");
    }
  }

  // KPI Calculations
  const totalProperties = properties.length;
  const totalUnits = allUnits.length;
  const occupiedUnits = allUnits.filter((u) => u.status === "OCCUPIED").length;
  const vacantUnits = allUnits.filter((u) => u.status === "VACANT").length;

  const filteredProperties = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-[#010736] flex flex-col md:flex-row selection:bg-[#010736] selection:text-white">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-slate-200 bg-white">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <img src={logoOnlyImg} alt="RentFlow" className="h-8 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight text-[#010736]">RentFlow</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#010736] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#010736]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout at Bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#010736] text-xs font-bold text-white shadow-xs">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-xs font-bold text-[#010736] truncate">
                  {user?.name}
                </span>
                <span className="text-[11px] font-medium text-slate-500 truncate">
                  {user?.role}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE TOP HEADER */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <img src={logoOnlyImg} alt="RentFlow" className="h-8 w-auto object-contain" />
          <span className="text-lg font-bold tracking-tight text-[#010736]">RentFlow</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 3. MOBILE SIDEBAR DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-white pt-5 pb-4 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <img src={logoOnlyImg} alt="RentFlow" className="h-7 w-auto object-contain" />
                <span className="text-lg font-bold text-[#010736]">RentFlow</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[#010736] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#010736]"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile User Info & Logout */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#010736] text-xs font-bold text-white shadow-xs">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#010736] truncate">{user?.name}</span>
                    <span className="text-[11px] font-medium text-slate-500">{user?.role}</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN WORKSPACE / CONTENT AREA */}
      <div className="flex-1 md:pl-64 flex flex-col justify-between min-h-screen">
        <main className="mx-auto max-w-7xl w-full px-4 py-6 sm:py-8 sm:px-6 lg:px-8 flex-1 animate-fade-in-up">
          {/* TAB 1: PROPERTIES (PRIMARY DASHBOARD) */}
          {activeTab === "properties" && (
            <div>
              {/* Welcome & Action Header */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#010736] sm:text-2xl lg:text-3xl">
                    Properties Overview
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                    Manage your rental buildings, units, and occupancy status.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddPropertyOpen(true)}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#010736] px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#0D1C42] active:scale-[0.99] transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Property</span>
                </button>
              </div>

              {/* Metric KPI Cards */}
              <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Properties
                    </span>
                    <div className="rounded-lg bg-slate-100 p-2 text-[#010736]">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-[#010736] sm:text-3xl">
                    {totalProperties}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">Buildings under management</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Units
                    </span>
                    <div className="rounded-lg bg-indigo-50 p-2 text-[#22396F]">
                      <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-bold text-[#010736] sm:text-3xl">
                    {totalUnits}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">Configured apartments</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Occupancy
                    </span>
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#010736] sm:text-3xl">
                      {occupiedUnits}
                    </span>
                    <span className="text-xs font-medium text-slate-500">Occupied</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-base font-bold text-emerald-600 sm:text-lg">
                      {vacantUnits}
                    </span>
                    <span className="text-xs font-medium text-slate-500">Vacant</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {totalUnits > 0
                      ? `${Math.round((occupiedUnits / totalUnits) * 100)}% occupied`
                      : "No units configured"}
                  </p>
                </div>
              </div>

              {/* Properties Header & Search */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#010736] sm:text-lg">All Properties</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                    {properties.length}
                  </span>
                </div>

                {properties.length > 0 && (
                  <div className="relative w-full sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name or address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-[#010736] focus:outline-none focus:ring-2 focus:ring-[#010736]/15"
                    />
                  </div>
                )}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center">
                  <Loader2 className="h-7 w-7 animate-spin text-[#010736]" />
                  <p className="mt-3 text-xs font-medium text-slate-600">Loading properties...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                  <div>
                    <p className="font-semibold">Unable to load data</p>
                    <p className="mt-0.5 text-xs text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && properties.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center">
                  <div className="rounded-full bg-slate-100 p-4 text-[#010736]">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#010736]">No properties yet</h3>
                  <p className="mt-1 max-w-sm text-xs sm:text-sm text-slate-500">
                    Get started by adding your first building or rental property.
                  </p>
                  <button
                    onClick={() => setIsAddPropertyOpen(true)}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#010736] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0D1C42] transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Your First Property</span>
                  </button>
                </div>
              )}

              {/* Properties Grid */}
              {!isLoading && filteredProperties.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProperties.map((prop) => (
                    <div
                      key={prop.id}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-bold text-[#010736] truncate">
                            {prop.name}
                          </h3>
                          <button
                            onClick={() => handleDeleteProperty(prop.id, prop.name)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete property"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#22396F]" />
                          <span className="truncate">{prop.address}</span>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            {prop._count?.units ?? 0} {prop._count?.units === 1 ? "Unit" : "Units"}
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenUnits(prop)}
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-[#010736] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0D1C42] active:scale-[0.99] transition-all"
                        >
                          <DoorOpen className="h-3.5 w-3.5" />
                          <span>Manage Units</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* OTHER TABS: SECTION PLACEHOLDERS */}
          {activeTab !== "properties" && (() => {
            const ActiveIcon = navItems.find((n) => n.id === activeTab)?.icon || Building2;
            return (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-8 sm:p-12 text-center animate-fade-in-up">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-[#010736]">
                  <ActiveIcon className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-[#010736] capitalize">
                  {activeTab} Management
                </h2>
                <p className="mt-1 max-w-md mx-auto text-xs sm:text-sm text-slate-500">
                  The {activeTab} section is ready for development. You can configure and manage your {activeTab} here.
                </p>
                <button
                  onClick={() => setActiveTab("properties")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#010736] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0D1C42] transition-colors"
                >
                  <span>Back to Properties</span>
                </button>
              </div>
            );
          })()}
        </main>

        {/* 5. FOOTER */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} RentFlow Property Management. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <a href="#" className="hover:text-[#010736] transition-colors">Privacy</a>
                <span className="text-slate-300">•</span>
                <a href="#" className="hover:text-[#010736] transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* MODAL 1: ADD PROPERTY */}
      {isAddPropertyOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4 backdrop-blur-xs animate-fade-in-up">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-[#010736]">Add New Property</h3>
              <button
                onClick={() => setIsAddPropertyOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {propFormError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{propFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProperty} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#010736]">
                  Property Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunrise Apartments"
                  value={propName}
                  onChange={(e) => setPropName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-[#010736] placeholder:text-slate-400 focus:border-[#010736] focus:outline-none focus:ring-2 focus:ring-[#010736]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#010736]">
                  Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123 Aurora Blvd, Quezon City"
                  value={propAddress}
                  onChange={(e) => setPropAddress(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-[#010736] placeholder:text-slate-400 focus:border-[#010736] focus:outline-none focus:ring-2 focus:ring-[#010736]/15"
                />
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPropertyOpen(false)}
                  className="w-full sm:w-auto rounded-lg border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProp}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#010736] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0D1C42] disabled:opacity-50"
                >
                  {isSubmittingProp ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  <span>Create Property</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGE UNITS MODAL */}
      {selectedPropertyForUnits && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4 backdrop-blur-xs animate-fade-in-up">
          <div className="w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#010736]">
                  {selectedPropertyForUnits.name} Units
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate max-w-xs sm:max-w-md">
                  <MapPin className="h-3 w-3 text-[#22396F] shrink-0" />
                  <span className="truncate">{selectedPropertyForUnits.address}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedPropertyForUnits(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Units List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {isLoadingUnits && (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#010736]" />
                  <p className="mt-2 text-xs text-slate-500">Loading units...</p>
                </div>
              )}

              {!isLoadingUnits && propertyUnits.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-500 text-xs">
                  No units added to this property yet. Add one using the form below.
                </div>
              )}

              {!isLoadingUnits &&
                propertyUnits.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 px-3.5 py-2.5 sm:px-4 sm:py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 font-bold text-xs text-[#010736]">
                        {u.unitNumber}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-[#010736]">
                          Unit {u.unitNumber}
                        </div>
                        <div className="text-[11px] sm:text-xs font-medium text-slate-500">
                          ₱{u.rentAmount.toLocaleString()} / mo
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-bold ${
                          u.status === "VACANT"
                            ? "bg-emerald-100 text-emerald-800"
                            : u.status === "OCCUPIED"
                            ? "bg-slate-200 text-slate-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {u.status}
                      </span>

                      <button
                        onClick={() => handleDeleteUnit(u.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete unit"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Quick Add Unit Form at bottom */}
            <div className="mt-3 border-t border-slate-200 pt-3 bg-slate-50/90 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-3xl sm:rounded-b-2xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#010736] mb-2.5">
                Add New Unit
              </h4>

              {unitFormError && (
                <div className="mb-2.5 flex items-center gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span>{unitFormError}</span>
                </div>
              )}

              <form onSubmit={handleCreateUnit} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Unit (e.g. 101)"
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-[#010736] placeholder:text-slate-400 focus:border-[#010736] focus:outline-none"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Rent (₱)"
                    value={unitRent}
                    onChange={(e) => setUnitRent(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-[#010736] placeholder:text-slate-400 focus:border-[#010736] focus:outline-none"
                  />
                </div>

                <div>
                  <select
                    value={unitStatus}
                    onChange={(e) => setUnitStatus(e.target.value as UnitStatus)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-[#010736] focus:border-[#010736] focus:outline-none"
                  >
                    <option value="VACANT">VACANT</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingUnit}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-[#010736] py-2 px-3 text-xs font-semibold text-white hover:bg-[#0D1C42] active:scale-[0.99] disabled:opacity-50 transition-colors"
                >
                  {isSubmittingUnit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  <span>Add Unit</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}