import React from "react";

function Table() {
  return (
    <div className="container">
      <div class="table-responsive">
        <table class="table">
          <thead class="thead-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>John Doe</td>
              <td>john.doe@example.com</td>
              <td>Admin</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Jane Smith</td>
              <td>jane.smith@example.com</td>
              <td>Editor</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Mike Taylor</td>
              <td>mike.taylor@example.com</td>
              <td>Viewer</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
