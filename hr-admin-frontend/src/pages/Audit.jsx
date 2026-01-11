import React, { useEffect, useState, useRef } from "react";
import Layout from "../components/Layout";
import { ProfileService } from "../api/services";
import {
  FiActivity,
  FiShield,
  FiLogIn,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiFilter,
  FiX,
  FiSearch,
  FiCalendar,
} from "react-icons/fi";
import DateRangeFilter from "../components/DateRangeFilter";

const Audit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    eventType: "ALL",
    details: "",
    startDate: "",
    endDate: "",
  });

  const [openHeader, setOpenHeader] = useState(null);

  const [tempEventSearch, setTempEventSearch] = useState("");
  const [tempDetails, setTempDetails] = useState("");

  const headerRef = useRef(null);

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, filters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpenHeader(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await ProfileService.getAuditLogs(
        page,
        pageSize,
        filters.eventType,
        filters.details,
        filters.startDate,
        filters.endDate
      );
      setLogs(response.data);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    setOpenHeader(null);
  };

  const removeFilter = (key) => {
    if (key === "date") {
      setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: key === "eventType" ? "ALL" : "",
      }));
    }
    setPage(1);
  };

  const toggleHeader = (header) => {
    if (openHeader === header) {
      setOpenHeader(null);
    } else {
      setOpenHeader(header);
      if (header === "DETAILS") setTempDetails(filters.details);
      if (header === "EVENT") setTempEventSearch("");
    }
  };

  const getIcon = (action) => {
    switch (action) {
      case "USER_LOGIN":
        return <FiLogIn className="text-green-600" size={20} />;
      case "IBAN_UPDATED":
        return <FiShield className="text-pink-600" size={20} />;
      case "IBAN_UPDATE_FAILED":
        return <FiShield className="text-red-600" size={20} />;
      case "PAYROLL_EXPORT":
      case "PAYSLIP_DOWNLOAD":
        return <FiDownload className="text-blue-600" size={20} />;
      default:
        return <FiActivity className="text-indigo-600" size={20} />;
    }
  };

  const getBadgeColor = (action) => {
    switch (action) {
      case "USER_LOGIN":
        return "bg-green-100 text-green-800";
      case "IBAN_UPDATED":
        return "bg-pink-100 text-pink-800";
      case "IBAN_UPDATE_FAILED":
        return "bg-red-100 text-red-800";
      case "PAYROLL_EXPORT":
      case "PAYSLIP_DOWNLOAD":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-indigo-100 text-indigo-800";
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    if (page <= 3) {
      start = 1;
      end = Math.min(totalPages, maxVisible);
    }

    if (page >= totalPages - 2) {
      start = Math.max(1, totalPages - maxVisible + 1);
      end = totalPages;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return { pages, start, end };
  };

  const filterOptions = [
    { label: "All Events", value: "ALL" },
    { label: "Logins", value: "USER_LOGIN" },
    { label: "Security Updates", value: "IBAN_UPDATED" },
    { label: "Failed Attempts", value: "IBAN_UPDATE_FAILED" },
    { label: "Data Exports", value: "PAYROLL_EXPORT" },
  ];

  const filteredOptions = filterOptions.filter((option) =>
    option.label.toLowerCase().includes(tempEventSearch.toLowerCase())
  );

  const getFilterLabel = (value) => {
    const option = filterOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  const hasActiveFilters =
    filters.eventType !== "ALL" ||
    filters.details ||
    filters.startDate ||
    filters.endDate;

  return (
    <Layout>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Audit</h1>
          <p className="text-gray-500 mt-1">
            Track all security events and account activities.
          </p>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px] pb-8">
        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-gray-400 uppercase mr-2">
              Active Filters:
            </span>

            {filters.eventType !== "ALL" && (
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-600/10 text-purple-600 rounded-full text-sm font-medium animate-fade-in">
                <span>Event: {getFilterLabel(filters.eventType)}</span>
                <button
                  onClick={() => removeFilter("eventType")}
                  className="hover:text-indigo-800 transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            {filters.details && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium animate-fade-in">
                <span>Details: "{filters.details}"</span>
                <button
                  onClick={() => removeFilter("details")}
                  className="hover:text-blue-900 transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            {(filters.startDate || filters.endDate) && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium animate-fade-in">
                <span>
                  Date: {filters.startDate || "..."} -{" "}
                  {filters.endDate || "..."}
                </span>
                <button
                  onClick={() => removeFilter("date")}
                  className="hover:text-orange-900 transition-colors"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            <button
              onClick={() =>
                setFilters({
                  eventType: "ALL",
                  details: "",
                  startDate: "",
                  endDate: "",
                })
              }
              className="text-xs text-gray-500 hover:text-gray-700 underline ml-auto"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="flex-grow overflow-x-visible">
          <table className="w-full text-left border-collapse relative">
            <thead ref={headerRef}>
              <tr className="bg-gray-50 border-b border-gray-100">
                {/* 1. Type Column */}
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase w-[11%]">
                  Type
                </th>

                {/* 2. Event Column (Lookup Filter) */}
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase w-[22%]">
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:text-purple-600 group relative"
                    onClick={() => toggleHeader("EVENT")}
                  >
                    <span>Event</span>
                    <FiFilter
                      className={`transition-colors ${
                        filters.eventType !== "ALL" || openHeader === "EVENT"
                          ? "text-purple-600"
                          : ""
                      }`}
                    />

                    {/* Dropdown */}
                    {openHeader === "EVENT" && (
                      <div
                        className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 cursor-default animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-3 py-2 border-b border-gray-100">
                          <input
                            type="text"
                            placeholder="Type to filter..."
                            value={tempEventSearch}
                            onChange={(e) => setTempEventSearch(e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-gray-700 placeholder-gray-400"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() =>
                                  applyFilter("eventType", option.value)
                                }
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors
                                                    ${
                                                      filters.eventType ===
                                                      option.value
                                                        ? "text-purple-600 font-bold bg-indigo-50"
                                                        : "text-gray-700"
                                                    }
                                                `}
                              >
                                {option.label}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-xs text-gray-400 text-center">
                              No matches found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </th>

                {/* 3. Details Column (Search Input Filter) */}
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase w-[44%]">
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:text-blue-600 group relative"
                    onClick={() => toggleHeader("DETAILS")}
                  >
                    <span>Details</span>
                    <FiSearch
                      className={`transition-colors ${
                        filters.details || openHeader === "DETAILS"
                          ? "text-blue-600"
                          : ""
                      }`}
                    />

                    {openHeader === "DETAILS" && (
                      <div
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 p-3 cursor-default animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-xs text-gray-500 mb-2 font-normal normal-case">
                          Search within details
                        </p>
                        <input
                          type="text"
                          placeholder="e.g. RO59…, export, failed"
                          value={tempDetails}
                          onChange={(e) => setTempDetails(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            applyFilter("details", tempDetails)
                          }
                          className="w-full text-sm border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </th>

                {/* 4. Timestamp Column (Calendar Filter) */}
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase text-right w-[22%]">
                  <div
                    className="flex items-center justify-end gap-2 cursor-pointer hover:text-orange-600 group relative"
                    onClick={() => toggleHeader("DATE")}
                  >
                    <span>Timestamp</span>
                    <FiCalendar
                      className={`transition-colors ${
                        filters.startDate ||
                        filters.endDate ||
                        openHeader === "DATE"
                          ? "text-orange-600"
                          : ""
                      }`}
                    />

                    {/* Calendar Dropdown */}
                    {openHeader === "DATE" && (
                      <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-fade-in-up cursor-default">
                        <DateRangeFilter
                          startDate={filters.startDate}
                          endDate={filters.endDate}
                          onApply={(start, end) => {
                            setFilters((prev) => ({
                              ...prev,
                              startDate: start,
                              endDate: end,
                            }));
                            setPage(1);
                            setOpenHeader(null);
                          }}
                          onClear={() => {
                            removeFilter("date");
                            setOpenHeader(null);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500">
                    Loading records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-400">
                    <FiClock className="mx-auto mb-2 opacity-50" size={32} />
                    <p>No activity found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 w-16">
                      <div className="p-2 bg-gray-50 rounded-lg inline-block shadow-sm">
                        {getIcon(log.action)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      {log.details || "No additional details"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-mono text-gray-500">
                      {new Date(log.timestamp).toLocaleString("ro-RO")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600 whitespace-nowrap">
              Showing{" "}
              <span className="font-medium">{(page - 1) * pageSize + 1}</span>–
              <span className="font-medium">
                {Math.min(page * pageSize, totalCount)}
              </span>{" "}
              of <span className="font-medium">{totalCount}</span>
            </div>

            {/* Center: Rows per page */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600"
              >
                {[5, 10, totalCount].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Right: Pagination */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded text-sm text-gray-600 hover:bg-white disabled:opacity-40"
              >
                <FiChevronLeft />
              </button>

              {page > 3 && (
                <>
                  <button
                    onClick={() => setPage(1)}
                    className="px-3 py-1.5 rounded text-sm hover:bg-white"
                  >
                    1
                  </button>
                  <span className="px-1 text-gray-400">…</span>
                </>
              )}

              {getPageNumbers().pages.map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded text-sm font-medium
            ${
              p === page
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:bg-white"
            }`}
                >
                  {p}
                </button>
              ))}

              {page < totalPages - 2 && (
                <>
                  <span className="px-1 text-gray-400">…</span>
                  <button
                    onClick={() => setPage(totalPages)}
                    className="px-3 py-1.5 rounded text-sm hover:bg-white"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded text-sm text-gray-600 hover:bg-white disabled:opacity-40"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Audit;
