import React from "react";
import {
  createSlice,
  createAsyncThunk,
  configureStore,
  combineReducers
} from "@reduxjs/toolkit";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import urlPropType from "url-prop-type";

import AddToChecklist from "./add-to-checklist";
import MaterialList from "../../core/MaterialList";

const resetStatus = createAsyncThunk("addToChecklist/resetStatus", () => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), 4000);
  });
});

const addToList = createAsyncThunk(
  "addToChecklist/addToList",
  async ({ materialListUrl, materialId }, { dispatch, rejectWithValue }) => {
    const client = new MaterialList({ baseUrl: materialListUrl });
    try {
      return await client.addListMaterial({ materialId });
    } catch (err) {
      dispatch(resetStatus());
      return rejectWithValue(err);
    }
  }
);

const addToChecklistSlice = createSlice({
  name: "addToChecklist",
  initialState: { status: "ready" },
  extraReducers: {
    [addToList.pending]: state => {
      state.status = "processing";
    },
    [addToList.rejected]: state => {
      state.status = "failed";
    },
    [resetStatus.fulfilled]: state => {
      state.status = "ready";
    }
  }
});

export const store = configureStore({
  reducer: combineReducers({
    addToChecklist: addToChecklistSlice.reducer
  })
});

function AddToChecklistEntry({
  materialListUrl,
  text,
  successText,
  errorText,
  id,
  loginUrl
}) {
  const status = useSelector(state => state.addToChecklist.status);
  const dispatch = useDispatch();
  return (
    <AddToChecklist
      text={text}
      errorText={errorText}
      successText={successText}
      status={status}
      onClick={() => dispatch(addToList({ materialListUrl, materialId: id }))}
      loginUrl={loginUrl}
      materialId={id}
    />
  );
}

AddToChecklistEntry.propTypes = {
  materialListUrl: urlPropType,
  text: PropTypes.string,
  errorText: PropTypes.string,
  successText: PropTypes.string,
  id: PropTypes.string.isRequired,
  loginUrl: urlPropType.isRequired
};

AddToChecklistEntry.defaultProps = {
  materialListUrl: "https://test.materiallist.dandigbib.org",
  text: "Tilføj til min liste",
  errorText: "Det lykkedes ikke at gemme materialet.",
  successText: "Materialet er tilføjet"
};

export default AddToChecklistEntry;
