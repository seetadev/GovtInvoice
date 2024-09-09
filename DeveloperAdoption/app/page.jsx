"use client";
import React, { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import Image from "next/image";
import add from "../public/Adder.png";
import Logo from "../public/Logo.png";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faTimes,
  faEdit,
  faTrash,
  faEllipsisV,
  faFolderPlus,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSpreadsheetDropdownOpen, setIsSpreadsheetDropdownOpen] =
    useState(false);
  const [spreadsheetName, setSpreadsheetName] = useState("");
  const [createdSheets, setCreatedSheets] = useState([]);
  const [editingSheetIndex, setEditingSheetIndex] = useState(null);
  const [newName, setNewName] = useState("");
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const router = useRouter();
  const dropdownRef = useRef(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openingSpreadsheet, setOpeningSpreadsheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRename = (index, e) => {
    e.stopPropagation();
    setEditingSheetIndex(index);
    setNewName(createdSheets[index].name);
    setDropdownIndex(null);
  };

  const filterSheets = (sheets) => {
    return sheets.filter((sheet) =>
      sheet.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        router.replace("/Login");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLoading(true);
    async function getUserData() {
      try {
        const response = await fetch("/api/User", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        setCreatedSheets(data.user.files);
        console.log("User Data:", data);
        setTimeout(() => setLoading(false), 1000);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }
    getUserData();
  }, [refresh]);

  useEffect(() => {
    setLoading(true);
    async function getUserData() {
      try {
        const response = await fetch("/api/User", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setCreatedSheets(data.user.files);
        setTimeout(() => setLoading(false), 1000);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setLoading(false);
      }
    }
    getUserData();
  }, [refresh]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    console.log("Page Refreshed");
  }, [refresh]);

  const getFirstName = () => {
    if (user && user.displayName) {
      const names = user.displayName.split(" ");
      return names[0];
    }
    return "User";
  };

  const handleSignOut = async () => {
    try {
      const response = await logoutUser();

      if (response.ok) {
        await signOut(auth);
        router.push("/Login");
      } else {
        console.error("Server logout failed");
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  async function logoutUser() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      const data = await response.json();

      if (data.success) {
        console.log("Logout successful");
      } else {
        console.error("Logout failed:", data.error);
      }

      return response;
    } catch (error) {
      console.error("An error occurred during logout:", error);
      throw error;
    }
  }

  async function createFile(fileName) {
    try {
      const response = await fetch("/api/User", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("File Created:", data);
      setRefresh(refresh + 1);
    } catch (error) {
      console.error("Failed to create file:", error);
    }
  }
  const handleSpreadsheetCreate = () => {
    setLoading(true)
    const spreadsheetNameTrim = spreadsheetName.trim();
    if (spreadsheetNameTrim) {
      createFile(spreadsheetNameTrim);
      setIsSpreadsheetDropdownOpen(false);
      setSpreadsheetName("");
    }
  };

  const handleSpreadsheetOpen = (id) => {
    setOpeningSpreadsheet(true);
    router.push(`/Spreadsheet/${id}`);
    setOpeningSpreadsheet(false);
  };

  const Loader = () => (
    <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  async function deleteFile(id) {
    try {
      const response = await fetch("/api/User", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("File Deleted:", data);
      setRefresh(refresh + 1);
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  }

  const handleRemove = (index) => {
    setLoading(true)
    deleteFile(createdSheets[index].id);
  };

  async function renameFile(id, fileName) {
    try {
      const response = await fetch("/api/User", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, fileName }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("File Renamed:", data);
      setEditingSheetIndex(null);
      setRefresh(refresh + 1);
    } catch (error) {
      console.error("Failed to rename file:", error);
    }
  }

  const handleSaveRename = (index, e) => {
    e.stopPropagation(); // Prevent the click from bubbling up
    setEditingSheetIndex(null);
    setLoading(true);
    renameFile(createdSheets[index].id, newName);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return now.toLocaleDateString("en-US", options);
  };

  const groupSheetsByDate = () => {
    const today = new Date().toLocaleDateString("en-GB");
    const yesterday = new Date(
      new Date().setDate(new Date().getDate() - 1)
    ).toLocaleDateString("en-GB");

    const groupedSheets = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    const filteredSheets = filterSheets(createdSheets);

    filteredSheets.forEach((sheet) => {
      if (sheet.createdAt === today) {
        groupedSheets.Today.push(sheet);
      } else if (sheet.createdAt === yesterday) {
        groupedSheets.Yesterday.push(sheet);
      } else {
        groupedSheets.Earlier.push(sheet);
      }
    });

    return groupedSheets;
  };

  const groupedSheets = groupSheetsByDate();

  return (
    <>
      <AnimatePresence>
        {(loading || openingSpreadsheet) && <Loader />}
      </AnimatePresence>
      <div className="bg-white min-h-screen text-black">
        <motion.nav
          className="bg-white shadow-md p-4 flex items-center justify-between relative"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex items-center space-x-4 h-6">
          <div className="flex items-center ">
            <Image src={Logo} alt="" className="w-20 contain-size" />
            <span className="text-purple-950 font-medium text-2xl relative right-3">Qubit</span>
          </div>
        </div>

          <div className="flex-grow mx-8 hidden md:block">
            <div className="relative w-full lg:w-[65%] lg:ml-52">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="w-5 h-5 text-gray-500"
                />
              </div>
              <input
                type="text"
                placeholder="Search spreadsheets"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-4 py-2 bg-gray-100 rounded-full border border-gray-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:text-black"
              />
            </div>
          </div>

          <div className="relative flex items-center text-white space-x-4">
            <motion.button
              className="focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center font-semibold">
                {user ? getFirstName().charAt(0).toUpperCase() : "U"}
              </div>
            </motion.button>
            {isDropdownOpen && (
              <motion.div
                className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="relative px-4 py-4 text-center bg-gray-100 border-b border-gray-300">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                  </button>
                  <div className="text-sm mt-2 font-semibold text-gray-700">
                    {user?.email || "Email not available"}
                  </div>
                  <div className="flex items-center justify-center mt-3">
                    <motion.div
                      className="rounded-full bg-blue-500 w-20 h-20 flex items-center justify-center text-3xl text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      {user?.displayName?.charAt(0).toUpperCase() || "U"}
                    </motion.div>
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mt-3">
                    {user?.displayName || "User"}
                  </div>
                </div>
                <div className="px-4 py-2">
                  <motion.button
                    className="w-full px-4 py-2 mt-1 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center"
                    onClick={handleSignOut}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Sign Out
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.nav>

        <motion.div
          className="bg-gray-200 flex items-center justify-center py-8 h-64 w-full relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="h-36 w-36 hover:scale-105 transform transition-transform duration-300 bg-white flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              onClick={() => setIsSpreadsheetDropdownOpen(true)}
            >
              <Image
                src={add}
                alt="New Spreadsheet"
                className="cursor-pointer"
              />
            </motion.div>
            <div
              className="text-center text-black mt-4 cursor-pointer"
              onClick={() => setIsSpreadsheetDropdownOpen(true)}
            >
              New Spreadsheet
            </div>
          </motion.div>
        </motion.div>

        {isSpreadsheetDropdownOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setIsSpreadsheetDropdownOpen(false)}
            ></div>
            <motion.div
              className="bg-white rounded-lg p-4 shadow-lg z-50"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="relative">
                <button
                  className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setIsSpreadsheetDropdownOpen(false)}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
              <input
                type="text"
                value={spreadsheetName}
                onChange={(e) => setSpreadsheetName(e.target.value)}
                placeholder="Spreadsheet Name"
                className="border rounded-lg p-2 mb-4 w-full"
              />
              <div className="flex items-center justify-center">
                <motion.button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                  onClick={handleSpreadsheetCreate}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Spreadsheet
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        <div className="flex flex-col items-center space-y-4 mt-6">
          {Object.entries(groupedSheets).map(
            ([group, sheets]) =>
              sheets.length > 0 && (
                <div key={group} className="w-full sm:w-[65%] px-4 sm:px-0">
                  <h2 className="text-lg font-bold mb-4">{group}</h2>
                  {sheets.map((sheet, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg shadow-md mb-4 hover:bg-green-100 relative cursor-pointer"
                      onClick={() => handleSpreadsheetOpen(sheet.id)}
                    >
                      {loading ? (
                        <motion.div
                          className="h-5 bg-gray-200 rounded-lg"
                          initial={{ opacity: 0.3 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatType: "mirror",
                          }}
                        />
                      ) : editingSheetIndex === index ? (
                        <div
                          className="flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-grow border rounded-lg p-2 mr-2"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <motion.button
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                            onClick={(e) => handleSaveRename(index, e)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Save
                          </motion.button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-grow mr-4">
                            <FontAwesomeIcon
                              icon={faFolderPlus}
                              className="h-8 flex-shrink-0"
                            />
                            <div className="truncate">{sheet.fileName}</div>
                          </div>
                          <div className="text-sm text-gray-500 whitespace-nowrap">
                            {sheet.createdAt}
                          </div>
                          <div className="relative ml-4">
                            <motion.button
                              className="text-gray-500 hover:text-blue-600 w-5 h-5 focus:outline-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDropdownIndex(
                                  dropdownIndex === index ? null : index
                                );
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FontAwesomeIcon icon={faEllipsisV} />
                            </motion.button>
                            {dropdownIndex === index && (
                              <motion.div
                                ref={dropdownRef}
                                className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                              >
                                <button
                                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 focus:outline-none"
                                  onClick={(e) => handleRename(index, e)}
                                >
                                  <FontAwesomeIcon
                                    icon={faEdit}
                                    className="mr-2"
                                  />
                                  Rename
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-100 focus:outline-none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(index);
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faTrash}
                                    className="mr-2"
                                  />
                                  Remove
                                </button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
