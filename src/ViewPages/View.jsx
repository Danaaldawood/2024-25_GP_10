import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { realtimeDb, db, auth } from "../Register/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import Search from "@mui/icons-material/Search";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AddIcon from "@mui/icons-material/Add";

import "./View.css";

export function RealtimeData() {
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
  const [filterRegion, setFilterRegion] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userRegion, setUserRegion] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [reasons, setReasons] = useState({});
  const [hoveredAddRow, setHoveredAddRow] = useState(null);
  const [hoveredNotifyRow, setHoveredNotifyRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tableContainerRef = useRef(null);
  // Number of items per page
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Handles clicking a row's for "Notify" button

  const handleClick = (row) => {
    if (
      row.region_name === userRegion &&
      row.annotations &&
      row.annotations.length > 0
    ) {
      const dropdownElement = document.querySelector(
        `select[data-row-id="${row.id}"]`
      );
      const selectedValue = dropdownElement ? dropdownElement.value : "";

      // Navigate to the Notify page with row details as state
      navigate(`/Notifymodrator/${row.id}`, {
        state: {
          id: row.id,
          topic: row.topic,
          attribute: row.en_question,
          region: row.region_name,
          selectedValue: selectedValue,
          allValues:
            row.annotations?.map((annotation) => annotation.en_values[0]) || [],
        },
      });
    }
  };

  // Fetch user region and order  tabel based on user reigon
  useEffect(() => {
    console.log("Fetching user region...");
    const fetchUserRegion = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "Users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserRegion(userData.region || "");
              console.log("User region set:", userData.region);
            }
          } catch (error) {
            console.error("Error fetching user region:", error);
          }
        }
      });
    };

    fetchUserRegion();

    // Fetch data from Firebase Realtime Database
    const unsubscribe = onValue(
      ref(realtimeDb, "/"),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const dataArray = [];

          Object.entries(data).forEach(([regionKey, regionData]) => {
            if (regionData.Details) {
              Object.entries(regionData.Details).forEach(([key, value]) => {
                dataArray.push({
                  id: `${regionKey}-${key}`,
                  ...value,
                  region_name: value.region_name || regionKey.replace("C", ""),
                });
              });
            }
          });

          setTableData(dataArray);
          console.log("Fetched data:", dataArray);

          // Initialize reasons for each row

          const initialReasons = dataArray.reduce((acc, row) => {
            const firstAnnotation = row.annotations?.[0];
            acc[row.id] = firstAnnotation
              ? firstAnnotation.reason
              : "Variation";
            return acc;
          }, {});
          setReasons(initialReasons);
        } else {
          setError("No data available in Firebase.");
        }
      },
      (error) => {
        setError("Error fetching data: " + error.message);
        console.error("Error fetching data:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  //Handles region filter

  const handleRegionChange = (e) => {
    setFilterRegion(e.target.value);
    setCurrentPage(1);
  };

  //Handles region search input

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    setCurrentPage(1);

    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  };

  // Handles topic filter
  const handleTopicChange = (e) => {
    const selectedTopic = e.target.value;
    setSearchTerm("");
    setFilterTopic(
      selectedTopic === "Holiday"
        ? "Holidays/Celebration/Leisure"
        : selectedTopic
    );
    setCurrentPage(1);
  };
  // Handles clicking the "Add" button for a row
  const handleAddClick = (row) => {
    if (row.region_name === userRegion) {
      const dropdownElement = document.querySelector(
        `select[data-row-id="${row.id}"]`
      );
      const selectedValue = dropdownElement ? dropdownElement.value : "";

      // Navigate to the edit (add)page with row details as state
      navigate(`/edit/${row.id}`, {
        state: {
          attribute: row.en_question,
          topic: row.topic,
          region: row.region_name,
          allValues:
            row.annotations?.map((annotation) => annotation.en_values[0]) || [],
          selectedValue: selectedValue,
        },
      });
    }
  };

  // Handles changes in the selected value for a row
  const handleValueChange = (rowId, selectedValue) => {
    const row = tableData.find((row) => row.id === rowId);
    if (row && row.annotations) {
      const selectedAnnotation = row.annotations.find(
        (annotation) => annotation?.en_values?.[0] === selectedValue
      );
      setReasons((prev) => ({
        ...prev,
        [rowId]: selectedAnnotation?.reason || "variation",
      }));
    }
  };
  // Handles page changes for pagination

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  };

  // Handles group navigation for pagination

  const handleGroupChange = (direction) => {
    const maxPagesVisible = 5;
    if (direction === "next") {
      const currentGroup = Math.ceil(currentPage / maxPagesVisible);
      const nextGroupStart = currentGroup * maxPagesVisible + 1;
      if (nextGroupStart <= totalPages) {
        setCurrentPage(nextGroupStart);
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTop = 0;
        }
      }
    } else {
      const prevGroupStart =
        (Math.ceil(currentPage / maxPagesVisible) - 1) * maxPagesVisible;
      if (prevGroupStart > 0) {
        setCurrentPage(prevGroupStart);
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTop = 0;
        }
      }
    }
  };

  // --filter and search --
  // Filters and sorts data based on search, region, and topic filters

  const filteredData = tableData
    .filter((row) => {
      const searchLower = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !searchTerm ||
        row.region_name?.toLowerCase().includes(searchLower) ||
        row.en_question?.toLowerCase().includes(searchLower) ||
        row.topic?.toLowerCase().includes(searchLower) ||
        row.annotations?.some((annotation) =>
          annotation.en_values?.[0]?.toLowerCase().includes(searchLower)
        );

      const matchesRegion =
        !filterRegion ||
        row.region_name?.toLowerCase().includes(filterRegion.toLowerCase());

      const matchesTopic =
        !filterTopic ||
        row.topic?.toLowerCase().includes(filterTopic.toLowerCase());

      return matchesSearch && matchesRegion && matchesTopic;
    })
    .sort((a, b) => {
      // Sort by user region first
      if (a.region_name === userRegion && b.region_name !== userRegion) {
        return -1;
      }
      if (a.region_name !== userRegion && b.region_name === userRegion) {
        return 1;
      }
      return 0;
    });

  // Calculates total pages and items to display for pagination

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  // Generates the range of pages to display in pagination

  const getPageRange = () => {
    const pageRange = [];
    const maxPagesVisible = 5;
    const currentGroup = Math.ceil(currentPage / maxPagesVisible);
    const start = (currentGroup - 1) * maxPagesVisible + 1;
    const end = Math.min(start + maxPagesVisible - 1, totalPages);

    for (let i = start; i <= end; i++) {
      pageRange.push(i);
    }
    return pageRange;
  };
  // Determines the displayed filter topic for holiday topic

  const displayedFilterTopic =
    filterTopic === "Holidays/Celebration/Leisure" ? "Holiday" : filterTopic;

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="viewpage">
      <Header />

      {/* Main container */}

      <div className="container mt-5">
        {/* Section for the table header */}

        <section className="tabel_header">
          <h2 className="table-title">Cultures Data</h2>
        </section>

        {/* container  for search and filter inputs */}

        <div className="filter-Search-inputs-container">
          {/* Search bar for filtering rows based oninput */}

          <div className="search-container">
            <span className="search-icon">
              <Search style={{ color: "#888", fontSize: "20px" }} />
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          {/* Dropdown filters for region and topic */}

          <div className="filter-container">
            {/* filter Reigon*/}

            <select
              className="filter-select"
              value={filterRegion}
              onChange={handleRegionChange}
            >
              <option value="">All Regions</option>
              <option value="Western">Western</option>
              <option value="Chinese">Chinese</option>
              <option value="Arab">Arab</option>
            </select>
            {/* Topics filter*/}
            <select
              className="filter-select"
              value={displayedFilterTopic}
              onChange={handleTopicChange}
            >
              <option value="">All Topics</option>
              <option value="Food">Food</option>
              <option value="Education">Education</option>
              <option value="Work life">Work life</option>
              <option value="Sport">Sport</option>
              <option value="Holiday">Holiday</option>
              <option value="Family">Family</option>
              <option value="Greeting">Greeting</option>
            </select>
          </div>
        </div>

        {/* Table container with scroll functionality */}

        <div className="scroll-container" ref={tableContainerRef}>
          <div className="table_container">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  {/* Table headers */}

                  <tr className="tabel_titles">
                    <th></th>
                    <th>Region</th>
                    <th>Attribute</th>
                    <th>Values</th>
                    <th>Topic</th>
                    <th>Reason</th>
                    <th>Add</th>
                    <th>Notify</th>
                  </tr>
                </thead>
                {/* --full a tabel rows using  attribut ,reigon,topic, values, reason data-- */}
                <tbody>
                  {currentItems.map((row, index) => (
                    <tr key={row.id}>
                      {/* Row index */}

                      <td>{indexOfFirstItem + index + 1}</td>
                      {/* reigon of attribut */}
                      <td>{row.region_name}</td>
                      {/* attribute */}
                      <td>{row.en_question}</td>
                      <td>
                        {row.annotations && row.annotations.length > 0 ? (
                          row.annotations.length > 1 ? (
                            <select
                              className="value-select"
                              data-row-id={row.id}
                              onChange={(e) =>
                                handleValueChange(row.id, e.target.value)
                              }
                            >
                              {row.annotations.map((annotation, i) => (
                                <option key={i} value={annotation.en_values[0]}>
                                  {annotation.en_values[0]}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span>{row.annotations[0].en_values[0]}</span>
                          )
                        ) : (
                          <span></span>
                        )}
                      </td>
                      <td
                        className={`topic-column ${
                          row.topic === "Holidays/Celebration/Leisure"
                            ? "left-align"
                            : "center-align"
                        }`}
                      >
                        {/* topic of attribute  */}
                        {row.topic}
                      </td>
                      {/* reason for values */}
                      <td>{reasons[row.id] || "variation"}</td>
                      {/* Add button with region restriction */}

                      <td
                        onMouseEnter={() => setHoveredAddRow(row.id)}
                        onMouseLeave={() => setHoveredAddRow(null)}
                        style={{ position: "relative" }}
                      >
                        <button
                          onClick={() => handleAddClick(row)}
                          className="add-button"
                          // enabel add button if attribute from user reigon
                          disabled={row.region_name !== userRegion}
                        >
                          <AddIcon style={{ marginRight: "5px" }} /> Add
                        </button>
                        {row.region_name !== userRegion &&
                          hoveredAddRow === row.id &&
                          !hoveredNotifyRow && (
                            <div className="custom-tooltip">
                              You don't belong to this region
                            </div>
                          )}
                      </td>

                      {/* Notify button with conditions */}

                      <td
                        onMouseEnter={() => setHoveredNotifyRow(row.id)}
                        onMouseLeave={() => setHoveredNotifyRow(null)}
                        style={{ position: "relative" }}
                      >
                        <button
                          onClick={() => handleClick(row)}
                          className="notify-button"
                          disabled={
                            row.region_name !== userRegion ||
                            !row.annotations ||
                            row.annotations.length === 0
                          }
                        >
                          <div className="notification-item">
                            <NotificationsActiveIcon
                              style={{ marginRight: "5px" }}
                            />
                            <span>Notify</span>
                          </div>
                        </button>
                        {/* enabel notify button if attribute from user reigon  */}

                        {row.region_name !== userRegion &&
                          hoveredNotifyRow === row.id &&
                          !hoveredAddRow && (
                            <div className="custom-tooltip">
                              You don't belong to this region
                            </div>
                          )}
                        {row.region_name === userRegion &&
                          (!row.annotations || row.annotations.length === 0) &&
                          hoveredNotifyRow === row.id && (
                            <div className="custom-tooltip">
                              No values available
                            </div>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}

            <div className="pagination-container">
              <button
                onClick={() => handleGroupChange("prev")}
                disabled={currentPage <= 5}
                className="pagination-button"
              >
                Previous
              </button>

              {getPageRange().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`pagination-button ${
                    pageNum === currentPage ? "active" : ""
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handleGroupChange("next")}
                disabled={Math.ceil(currentPage / 5) * 5 >= totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RealtimeData;
