import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

import api from "../api/api.js";
import { PAGE_SIZE, SEARCH_TEXT } from "../constants.js";

const header = ["Name", "Email", "Role", "Actions"];

const AdminDashboard = () => {
  const [tableRows, setTableRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);
  const [rowInEditMode, setRowInEditMode] = useState(-1);
  const [searchText, setSearchText] = useState(SEARCH_TEXT);
  const [maxPageNumber, setMaxPageNumber] = useState(0);
  const [page, setPage] = useState(1);

  let editableRow = {};

  useEffect(() => {}, [selectedRow]);

  useEffect(() => {
    const maxPage = Math.ceil(filteredRows.length / PAGE_SIZE);
    setMaxPageNumber(maxPage);
  }, [filteredRows]);

  useEffect(() => {
    async function getData() {
      const result = await api.fetchMembers(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      );
      console.log(result);
      setTableRows(result);
      setFilteredRows(result);
    }
    getData();
  }, []);

  const editButton = (rowId) => {
    let editMode = rowInEditMode === parseInt(rowId);
    const handleUpdateRow = (editMode) => {
      if (!editMode) {
        editableRow = filteredRows.find(
          (row) => parseInt(row.id) === parseInt(rowId)
        );
        setRowInEditMode(parseInt(rowId));
      } else {
        // save changes
        console.log("editable row::", editableRow);
        editMode = !editMode;
        setRowInEditMode(-1);
        let currentRow = filteredRows.find(
          (row) => parseInt(row.id) === parseInt(rowId)
        );
        Object.keys(editableRow).forEach((key) => {
          currentRow[key] = editableRow[key];
        });
        // const filteredData =
        setFilteredRows([...filteredRows, currentRow]);
        console.log("Filtered Rows::", filteredRows);
        editableRow = {};
      }
    };

    let buttonName = editMode ? "Save" : "Edit";
    return (
      <button
        onClick={() => {
          handleUpdateRow(editMode);
        }}
      >
        {" "}
        {buttonName}{" "}
      </button>
    );
  };

  const deleteButton = (rowId) => {
    const handleDelete = () => {
      console.log("DELETE BUTTON::", rowId);
      const newArr = filteredRows.filter(
        (row) => parseInt(row.id) !== parseInt(rowId)
      );
      setFilteredRows(newArr);
    };

    return <button onClick={() => handleDelete()}> Delete </button>;
  };

  const getActions = (rowId) => {
    return (
      <div
        style={{ display: "flex", flexGrow: 1, justifyContent: "space-evenly" }}
      >
        {editButton(rowId)}
        {deleteButton(rowId)}
      </div>
    );
  };

  const deleteSelectedButton = () => {
    const handleSelectedDelete = () => {
      console.log("deleteSelectedButton-selectedRow:::", selectedRow);
      console.log("deleteSelectedButton-filteredRows:::", filteredRows);
      const newArr = filteredRows.filter(
        (row) => !selectedRow.includes(parseInt(row.id))
      );
      console.log("deleteSelectedButton-newArr:::", newArr);
      setFilteredRows(newArr);
      setSelectedRow([]);
      console.log("deleteSelectedButton:::", selectedRow);
    };
    return (
      <button
        onClick={() => {
          handleSelectedDelete();
        }}
        style={{
          backgroundColor: "red",
          color: "white",
          width: "8rem",
          marginRight: "10vw",
          borderRadius: 10,
          border: "2px solid red",
        }}
      >
        Delete Selected
      </button>
    );
  };

  const displayPagination = () => {
    return (
      <div
        style={{
          display: "flex",
          border: "1px solid white",
          justifyContent: "space-between",
          //   backgroundColor: "green",
          width: "60rem",
        }}
      >
        <button onClick={() => {}} className="pagination-btn">
          {"<<"}
        </button>
        <button onClick={() => {}} className="pagination-btn">
          {"<"}
        </button>
        {Array.from({ length: maxPageNumber }, (_, i) => i + 1).map((elt) => {
          return (
            <button onClick={() => {}} className="pagination-btn" style={elt === page ? {backgroundColor: "lightblue"}: {}} >
              {" "}
              {elt}
            </button>
          );
        })}
        <button onClick={() => {}} className="pagination-btn">
          {">"}
        </button>

        <button onClick={() => {}} className="pagination-btn">
          {">>"}
        </button>
      </div>
    );
  };

  const searchBox = () => {
    const input = document.getElementById("search_text");
    input &&
      input.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          console.log("enter pressed");
          event.preventDefault();
          console.log("event capture::", event.target.value);
          handleSearchUpdate(event.target.value);
        }
      });

    const handleSearchUpdate = (text) => {
      text = text.toLowerCase();
      if (text !== "") {
        const filteredData = filteredRows.filter(
          (row) =>
            row.name.toLowerCase().includes(text) ||
            row.role.toLowerCase().includes(text) ||
            row.email.toLowerCase().includes(text)
        );
        setFilteredRows(filteredData);
      } else {
        setFilteredRows(tableRows);
      }
    };

    const handleInputChange = (value) => {
      if (value === "") setFilteredRows(tableRows);
      setSearchText(value);
    };

    return (
      <input
        id="search_text"
        type="search"
        defaultValue={SEARCH_TEXT}
        onChange={(e) => handleInputChange(e.target.value)}
        style={{
          display: "flex",
          flexGrow: 1,
          width: "95vw",
          margin: "2vw 0 2vw",
        }}
        value={searchText}
      />
    );
  };

  const handleRowValueChange = (rowId, property, value) => {
    // debouncing
    if (parseInt(rowId) === rowInEditMode) {
      let timeoutId;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        editableRow[property] = value;
      }, 1000);
    }
  };

  const displayRows = (rowId, property, data, isEditable = false) => {
    isEditable = rowInEditMode === parseInt(rowId);
    // isEditable = selectedRow.includes(parseInt(rowId))
    return isEditable ? (
      <input
        type="text"
        name="row-input"
        alt="table-row"
        defaultValue={data}
        onChange={(e) => handleRowValueChange(rowId, property, e.target.value)}
      />
    ) : (
      data
    );
  };

  const getCheckBox = (rowId) => {
    const handleSelectCheckBox = (rowId) => {
      const id = parseInt(rowId);
      if (selectedRow.includes(id)) {
        if (id === 0) {
          setSelectedRow([]);
        } else {
          const newArr = selectedRow.filter(
            (rowid) => rowid !== id && rowid !== 0
          );
          setSelectedRow([...newArr]);
        }
      } else if (rowId === 0) {
        const currentSelectedRows = filteredRows.map((row) => parseInt(row.id));
        setSelectedRow([...currentSelectedRows, rowId]);
        setTimeout(() => {}, 1000);
      } else {
        console.log([...selectedRow, id]);
        setSelectedRow([...selectedRow, id]);
      }
    };

    return (
      <input
        type="checkbox"
        name="checkbox"
        checked={selectedRow.includes(parseInt(rowId))}
        onChange={() => handleSelectCheckBox(rowId)}
      />
    );
  };

  const footer = () => {
    return (
      <div
        style={{
          display: "flex",
          margin: "2rem",
        }}
      >
        {deleteSelectedButton()}
        {displayPagination()}
      </div>
    );
  };

  return (
    <>
      {searchBox()}
      <table>
        <thead>
          {getCheckBox(0)}
          {header.map((heading, index) => {
            return <th>{heading}</th>;
          })}
        </thead>
        <tbody class="table-body">
          {filteredRows.map((row, id) => {
            return (
              <tr>
                <td>{getCheckBox(row.id)} </td>
                <td> {displayRows(row.id, "name", row.name)} </td>
                <td> {displayRows(row.id, "email", row.email)} </td>
                <td> {displayRows(row.id, "role", row.role)} </td>
                <td> {getActions(row.id)} </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {footer()}
    </>
  );
};

export default AdminDashboard;
