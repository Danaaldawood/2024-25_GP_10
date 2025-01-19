import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { realtimeDb, db, auth } from "../Register/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import "bootstrap/dist/css/bootstrap.min.css";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";
import Search from "@mui/icons-material/Search";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AddIcon from "@mui/icons-material/Add";
import "./View.css";

export function RealtimeData() {
  // Translation hook with namespace
  const { t, i18n } = useTranslation("viewPage");

  // State management
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
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const getDisplayReason = (row, reason) => {
    // First check if there are any annotations/values
    if (!row.annotations || row.annotations.length === 0) {
      return ''; // Return empty string if no annotations
    }
  
    const currentLang = i18n.language;
    const annotation = row.annotations?.find(a => a.reason === reason);
    
    if (currentLang === 'ar' && row.region_name === 'Arab' && annotation?.reason_lan) {
      return annotation.reason_lan;
    } else if (currentLang === 'ch' && row.region_name === 'Chinese' && annotation?.reason_lan) {
      return annotation.reason_lan;
    }
    return reason;
  };
  const getDisplayRegion = (row) => {
    const currentLang = i18n.language;
    if (currentLang === "ar" && row.region_name === "Arab" && row.region_lan) {
      return row.region_lan;
    } else if (
      currentLang === "ch" &&
      row.region_name === "Chinese" &&
      row.region_lan
    ) {
      return row.region_lan;
    }
    return row.region_name;
  };

  const getDisplayTopic = (row) => {
    const currentLang = i18n.language;
    if (currentLang === "ar" && row.region_name === "Arab" && row.topic_lan) {
      return row.topic_lan;
    } else if (
      currentLang === "ch" &&
      row.region_name === "Chinese" &&
      row.topic_lan
    ) {
      return row.topic_lan;
    }
    return row.topic;
  };

  // Get display value based on current language and region
  const getDisplayValue = (row) => {
    const currentLang = i18n.language;
    if (currentLang === "ar" && row.region_name === "Arab" && row.question) {
      return row.question;
    } else if (
      currentLang === "ch" &&
      row.region_name === "Chinese" &&
      row.question
    ) {
      return row.question;
    }
    return row.en_question;
  };

  // Get display value for annotation based on current language and region
  const getDisplayValueForAnnotation = (annotation, regionName) => {
    const currentLang = i18n.language;
    if (currentLang === "ar" && regionName === "Arab" && annotation.values) {
      return annotation.values[0];
    } else if (
      currentLang === "ch" &&
      regionName === "Chinese" &&
      annotation.values
    ) {
      return annotation.values[0];
    }
    return annotation.en_values[0];
  };

  // Handle notification click
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

      navigate(`/Notifymodrator/${row.id}`, {
        state: {
          id: row.id,
          topic: row.topic,
          attribute: getDisplayValue(row),
          region: row.region_name,
          selectedValue: selectedValue,
          allValues:
            row.annotations?.map((annotation) =>
              getDisplayValueForAnnotation(annotation, row.region_name)
            ) || [],
        },
      });
    }
  };

  // Fetch user data and initialize realtime database listener
  useEffect(() => {
    const fetchUserRegion = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "Users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserRegion(userData.region || "");
            }
          } catch (error) {
            console.error("Error fetching user region:", error);
          }
        }
      });
    };

    fetchUserRegion();

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

          const initialReasons = dataArray.reduce((acc, row) => {
            // Only set a reason if there are annotations
            if (row.annotations && row.annotations.length > 0) {
              const firstAnnotation = row.annotations[0];
              acc[row.id] = firstAnnotation.reason;
            }
            return acc;
          }, {});
          setReasons(initialReasons);
        } else {
          setError(t("no_data"));
        }
      },
      (error) => {
        setError(t("fetch_error") + error.message);
        console.error("Error fetching data:", error);
      }
    );

    return () => unsubscribe();
  }, [t]);

  // Filter handlers
  const handleRegionChange = (e) => {
    setFilterRegion(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  };

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

  // Handle add button click
  const handleAddClick = (row) => {
    if (row.region_name === userRegion) {
      const dropdownElement = document.querySelector(`select[data-row-id="${row.id}"]`);
      const selectedValue = dropdownElement ? dropdownElement.value : "";
  
      // Convert annotations to the correct format
      const allValues = row.annotations?.map(annotation => {
        return {
          en_values: annotation.en_values || [],
          values: annotation.values || [],
          reason: annotation.reason
        };
      }) || [];
  
      // Log the values being passed to verify structure
      console.log('Values being passed:', allValues);
  
      navigate(`/edit/${row.id}`, {
        state: {
          attribute: getDisplayValue(row),
          question: row.question, // Arabic translation
          ch_question: row.ch_question, // Chinese translation
          en_question: row.en_question,
          topic: row.topic,
          topic_lan: row.topic_lan,
          region: row.region_name,
          region_lan: row.region_lan,
          allValues: allValues,
          selectedValue: selectedValue,
        },
      });
    }
  };

  // Value change handler
  const handleValueChange = (rowId, selectedValue) => {
    const row = tableData.find((row) => row.id === rowId);
    if (row && row.annotations) {
      const selectedAnnotation = row.annotations.find(
        (annotation) =>
          getDisplayValueForAnnotation(annotation, row.region_name) === selectedValue
      );
      setReasons((prev) => ({
        ...prev,
        [rowId]: selectedAnnotation?.reason || "variation",
      }));
    }
  };

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  };

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

  // Filter and search data
  const filteredData = tableData
    .filter((row) => {
      const searchLower = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !searchTerm ||
        row.region_name?.toLowerCase().includes(searchLower) ||
        getDisplayValue(row)?.toLowerCase().includes(searchLower) ||
        row.topic?.toLowerCase().includes(searchLower) ||
        row.annotations?.some((annotation) =>
          getDisplayValueForAnnotation(annotation, row.region_name)
            ?.toLowerCase()
            .includes(searchLower)
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
      if (a.region_name === userRegion && b.region_name !== userRegion)
        return -1;
      if (a.region_name !== userRegion && b.region_name === userRegion)
        return 1;
      return 0;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

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

  const displayedFilterTopic =
    filterTopic === "Holidays/Celebration/Leisure" ? "Holiday" : filterTopic;

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={`viewpage ${i18n.language === "ar" ? "rtl" : "ltr"}`}>
      <Header />
      <div className="container mt-5">
        <section className="tabel_header">
          <h2 className="table-title">{t("viewPage.cultures_data")}</h2>
        </section>

        <div className="filter-Search-inputs-container">
          <div className="search-container">
            <span className="search-icon">
              <Search style={{ color: "#888", fontSize: "20px" }} />
            </span>
            <input
              type="text"
              className="search-input"
              placeholder={t("viewPage.search_placeholder")}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="filter-container">
            <select
              className="filter-select"
              value={filterRegion}
              onChange={handleRegionChange}
            >
              <option value="">{t("viewPage.all_regions")}</option>
              <option value="Western">{t("viewPage.western")}</option>
              <option value="Chinese">{t("viewPage.chinese")}</option>
              <option value="Arab">{t("viewPage.arab")}</option>
            </select>

            <select
              className="filter-select"
              value={displayedFilterTopic}
              onChange={handleTopicChange}
            >
              <option value="">{t("viewPage.all_topics")}</option>
              <option value="Food">{t("viewPage.food")}</option>
              <option value="Education">{t("viewPage.education")}</option>
              <option value="Work life">{t("viewPage.work_life")}</option>
              <option value="Sport">{t("viewPage.sport")}</option>
              <option value="Holiday">{t("viewPage.holiday")}</option>
              <option value="Family">{t("viewPage.family")}</option>
              <option value="Greeting">{t("viewPage.greeting")}</option>
            </select>
          </div>
        </div>

        <div className="scroll-container" ref={tableContainerRef}>
          <div className="table_container">
            <table className="data-table">
              <thead>
                <tr className="tabel_titles">
                  <th></th>
                  <th>{t("viewPage.region")}</th>
                  <th>{t("viewPage.attribute")}</th>
                  <th>{t("viewPage.values")}</th>
                  <th>{t("viewPage.topic")}</th>
                  <th>{t("viewPage.reason")}</th>
                  <th>{t("viewPage.add")}</th>
                  <th>{t("viewPage.notify")}</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((row, index) => (
                  <tr key={row.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{getDisplayRegion(row)}</td>
                    <td>{getDisplayValue(row)}</td>
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
                              <option
                                key={i}
                                value={getDisplayValueForAnnotation(
                                  annotation,
                                  row.region_name
                                )}
                              >
                                {getDisplayValueForAnnotation(
                                  annotation,
                                  row.region_name
                                )}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>
                            {getDisplayValueForAnnotation(
                              row.annotations[0],
                              row.region_name
                            )}
                          </span>
                        )
                      ) : (
                        <span></span>
                      )}
                    </td>
                    <td>{getDisplayTopic(row)}</td>
                    <td>{getDisplayReason(row, reasons[row.id] || 'variation' || "")}</td>
                    <td
                      onMouseEnter={() => setHoveredAddRow(row.id)}
                      onMouseLeave={() => setHoveredAddRow(null)}
                      style={{ position: "relative" }}
                    >
                      <button
                        onClick={() => handleAddClick(row)}
                        className="add-button"
                        disabled={row.region_name !== userRegion}
                      >
                        <AddIcon style={{ marginRight: "5px" }} />{" "}
                        {t("viewPage.add")}
                      </button>
                      {row.region_name !== userRegion &&
                        hoveredAddRow === row.id &&
                        !hoveredNotifyRow && (
                          <div className="custom-tooltip">
                            {t("viewPage.not_your_region")}
                          </div>
                        )}
                    </td>
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
                          <span>{t("viewPage.notify")}</span>
                        </div>
                      </button>
                      {row.region_name !== userRegion &&
                        hoveredNotifyRow === row.id &&
                        !hoveredAddRow && (
                          <div className="custom-tooltip">
                            {t("viewPage.not_your_region")}
                          </div>
                        )}
                      {row.region_name === userRegion &&
                        (!row.annotations || row.annotations.length === 0) &&
                        hoveredNotifyRow === row.id && (
                          <div className="custom-tooltip">
                            {t("viewPage.no_values_available")}
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="pagination-container">
            <button
              onClick={() => handleGroupChange("prev")}
              disabled={currentPage <= 5}
              className="pagination-button"
            >
              {t("viewPage.previous")}
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
              {t("viewPage.next")}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RealtimeData;
