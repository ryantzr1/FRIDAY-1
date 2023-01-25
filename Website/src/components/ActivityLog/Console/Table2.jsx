import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "./Table2.css";

function createData(name, answer, queryId, date, status) {
  return { name, answer, queryId, date, status };
}

const rows = [
  createData("What sort of camera does the drone use?", "The drone uses a 4/3 CMOS camera.", 18908426, "25 January 2023", "Answered"),
  createData("direct hard drop on floor?", "Answer Redirected.", 18908425, "25 January 2023", "Redirected"),
  createData("What is the colour of the drone?", "The drone is a sleek silver colour.", 18908424, "25 January 2023", "Answered"),
  createData("How long does the drone last for?", "The drone will last for 6 hours.", 18908423, "25 January 2023", "Answered"),
  createData("How fast does the drone fly?", "The drone flies at 18 mph.", 18908422, "23 January 2023", "Answered"),
  createData("How high does the drone fly for?", "The drone can fly to a height of 25m.", 18908421, "23 January 2023", "Answered"),
  createData("Does the drone come with warrenty?", "Yes, it does.", 18908420, "23 January 2023", "Answered"),
  createData("Can the drone function well underwater?", "No, it cannot.", 18908419, "23 January 2023", "Answered"),
  createData("If I drop the drone in the water for a while, will it still work?", "Answer Redirected.", 18908418, "22 January 2023", "Redirected"),
  createData("Can I buy the drone at a discount?", "Answer Redirected", 18908417, "22 January 2023", "Redirected"),
  createData("Does the drone come in black colour?", "No it does.", 18908416, "22 January 2023", "Answered"),
  createData("What is the lifespan usage of the drone?", "The drone would typically last for 1 year with moderate use.", 18908415, "22 January 2023", "Answered"),
];

const makeStyle=(status)=>{
  if(status === 'Answered')
  {
    return {
      background: 'rgb(145 254 159 / 47%)',
      color: 'green',
    }
  }
  else if(status === 'Redirected')
  {
    return{
      background: '#ffadad8f',
      color: 'red',
    }
  }
  else{
    return{
      background: '#59bfff',
      color: 'white',
    }
  }
}

export default function Table2() {
  return (
      <div className="Table">
        <TableContainer
          component={Paper}
          style={{ boxShadow: "0px 13px 20px 0px #80808029", width: 1200, height: 500}}
        >
          <Table sx={{ minWidth: 650, width: 1500 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 100 }} className="FirstCol">&nbsp;&nbsp;&nbsp;&nbsp;Status</TableCell>
                <TableCell sx={{ width: 400 }} align="left">Queries</TableCell>
                <TableCell sx={{ width: 400 }} align="left">Answer</TableCell>
                <TableCell align="left">Query ID</TableCell>
                <TableCell align="left">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody style={{ color: "white" }}>
              {rows.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row" className="FirstCol">
                    <span className="status" style={makeStyle(row.status)}>{row.status}</span>
                  </TableCell>
                  <TableCell align="left">{row.name}</TableCell>
                  <TableCell align="left">{row.answer}</TableCell>
                  <TableCell align="left">{row.queryId}</TableCell>
                  <TableCell align="left">{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
  );
}