import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api";
import { apiErrMessage } from "../utils/apiError";
import { logoutUser } from "./userSlice";
import type {
  WebBackendInternalAppSerializerHeatingComponentJSON,
  WebBackendInternalAppSerializerHeatingJSON,
} from "../../api/Api";

export interface HeatingDetailPayload {
  components: WebBackendInternalAppSerializerHeatingComponentJSON[];
  heating: WebBackendInternalAppSerializerHeatingJSON;
}

function defaultListFilters() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  const day = `${y}-${m}-${d}`;
  return { fromDate: day, toDate: day, status: "", creatorLogin: "" };
}

function buildInitialState() {
  return {
    cart: null as {
      has_draft: boolean;
      components_count: number;
      id?: number;
      incomplete_items_count?: number;
    } | null,
    cartLoading: false,
    detail: null as HeatingDetailPayload | null,
    detailLoading: false,
    detailError: null as string | null,
    list: [] as WebBackendInternalAppSerializerHeatingJSON[],
    listLoading: false,
    listError: null as string | null,
    filters: defaultListFilters(),
    itemMutationLoading: {} as Record<string, boolean>,
    heatingMutationLoading: false,
  };
}

function asDetail(data: unknown): HeatingDetailPayload | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const app = o.heating;
  const items = o.components;
  if (!app || typeof app !== "object" || !Array.isArray(items)) return null;
  return {
    components: items as WebBackendInternalAppSerializerHeatingComponentJSON[],
    heating: app as WebBackendInternalAppSerializerHeatingJSON,
  };
}

type CartSliceUser = { user: { isAuthenticated: boolean } };

function emptyGuestCartPayload() {
  return {
    has_draft: false,
    components_count: 0,
    incomplete_items_count: 0 as number | undefined,
    id: undefined as number | undefined,
  };
}

export const fetchHeatingCart = createAsyncThunk(
  "heatings/fetchCart",
  async (_, { rejectWithValue, getState }) => {
    const before = getState() as CartSliceUser;
    if (!before.user.isAuthenticated) {
      return emptyGuestCartPayload();
    }
    try {
      const r = await api.heating.heatingCartList();
      const after = getState() as CartSliceUser;
      if (!after.user.isAuthenticated) {
        return emptyGuestCartPayload();
      }
      const d = r.data as Record<string, unknown>;
      return {
        has_draft: Boolean(d.has_draft),
        components_count: Number(d.components_count ?? 0),
        id: typeof d.id === "number" ? d.id : undefined,
        incomplete_items_count:
          typeof d.incomplete_items_count === "number" ? d.incomplete_items_count : undefined,
      };
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const fetchHeatingDetail = createAsyncThunk(
  "heatings/fetchDetail",
  async (heatingId: number, { rejectWithValue }) => {
    try {
      const r = await api.heating.heatingDetail(heatingId);
      const detail = asDetail(r.data);
      if (!detail) return rejectWithValue("Неверный ответ сервера");
      return detail;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const addComponentToHeating = createAsyncThunk(
  "heatings/addComponent",
  async (componentId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.heatingComponent.postHeatingComponent(componentId);
      await dispatch(fetchHeatingCart());
      return componentId;
    } catch (e) {
      if (axiosStatus(e) === 409) {
        await dispatch(fetchHeatingCart());
        return componentId;
      }
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

function axiosStatus(e: unknown): number | undefined {
  if (e && typeof e === "object" && "response" in e) {
    const r = (e as { response?: { status?: number } }).response;
    return r?.status;
  }
  return undefined;
}

export const updateComponentLineInHeating = createAsyncThunk(
  "heatings/updateLine",
  async (
    {
      componentId,
      heatingId,
      body,
    }: {
      componentId: number;
      heatingId: number;
      body: WebBackendInternalAppSerializerHeatingComponentJSON;
    },
    { rejectWithValue, dispatch },
  ) => {
    const key = `${componentId}-${heatingId}`;
    try {
      await api.heatingComponent.heatingComponentUpdate(componentId, heatingId, body);
      await dispatch(fetchHeatingDetail(heatingId));
      return key;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const removeComponentLineFromHeating = createAsyncThunk(
  "heatings/removeLine",
  async (
    { componentId, heatingId }: { componentId: number; heatingId: number },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.heatingComponent.heatingComponentDelete(componentId, heatingId);
      await dispatch(fetchHeatingDetail(heatingId));
      await dispatch(fetchHeatingCart());
      return componentId;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const editHeating = createAsyncThunk(
  "heatings/editHeating",
  async (
    {
      heatingId,
      body,
    }: {
      heatingId: number;
      body: WebBackendInternalAppSerializerHeatingJSON;
    },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.heating.editHeatingUpdate(heatingId, body);
      await dispatch(fetchHeatingDetail(heatingId));
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const formHeating = createAsyncThunk(
  "heatings/form",
  async (heatingId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.heating.formHeatingUpdate(heatingId);
      await dispatch(fetchHeatingDetail(heatingId));
      await dispatch(fetchHeatingCart());
      await dispatch(fetchHeatingsList());
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const deleteHeating = createAsyncThunk(
  "heatings/deleteHeating",
  async (heatingId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.heating.deleteHeatingDelete(heatingId);
      await dispatch(fetchHeatingCart());
      await dispatch(fetchHeatingsList());
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const finishHeating = createAsyncThunk(
  "heatings/finish",
  async (
    { heatingId, status }: { heatingId: number; status: "completed" | "rejected" },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.heating.finishHeatingUpdate(heatingId, {
        status,
      });
      await dispatch(fetchHeatingsList());
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const fetchHeatingsList = createAsyncThunk(
  "heatings/fetchList",
  async (_, { getState, rejectWithValue }) => {
    try {
      const st = getState() as {
        heating: { filters: ReturnType<typeof defaultListFilters> };
      };
      const f = st.heating.filters;
      const query: { "from-date"?: string; "to-date"?: string; status?: string } = {};
      if (f.fromDate) query["from-date"] = f.fromDate;
      if (f.toDate) query["to-date"] = f.toDate;
      if (f.status) query.status = f.status;
      const r = await api.heating.allHeatingsList(query);
      return r.data;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

const heatingSlice = createSlice({
  name: "heating",
  initialState: buildInitialState(),
  reducers: {
    clearHeatingDetailError: (state) => {
      state.detailError = null;
    },
    setListFilters: (
      state,
      action: PayloadAction<Partial<ReturnType<typeof defaultListFilters>>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetListFiltersToToday: (state) => {
      state.filters = defaultListFilters();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser, () => buildInitialState())
      .addCase(fetchHeatingCart.pending, (state) => {
        state.cartLoading = true;
      })
      .addCase(fetchHeatingCart.fulfilled, (state, action) => {
        state.cartLoading = false;
        state.cart = action.payload;
      })
      .addCase(fetchHeatingCart.rejected, (state) => {
        state.cartLoading = false;
        state.cart = {
          has_draft: false,
          components_count: 0,
          incomplete_items_count: 0,
        };
      })
      .addCase(fetchHeatingDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.detail = null;
      })
      .addCase(fetchHeatingDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchHeatingDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload as string;
      })
      .addCase(fetchHeatingsList.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchHeatingsList.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchHeatingsList.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload as string;
      })
      .addCase(addComponentToHeating.pending, (state) => {
        state.heatingMutationLoading = true;
      })
      .addCase(addComponentToHeating.fulfilled, (state) => {
        state.heatingMutationLoading = false;
      })
      .addCase(addComponentToHeating.rejected, (state) => {
        state.heatingMutationLoading = false;
      })
      .addCase(editHeating.pending, (state) => {
        state.heatingMutationLoading = true;
      })
      .addCase(editHeating.fulfilled, (state) => {
        state.heatingMutationLoading = false;
      })
      .addCase(editHeating.rejected, (state) => {
        state.heatingMutationLoading = false;
      })
      .addCase(formHeating.pending, (state) => {
        state.heatingMutationLoading = true;
      })
      .addCase(formHeating.fulfilled, (state) => {
        state.heatingMutationLoading = false;
      })
      .addCase(formHeating.rejected, (state) => {
        state.heatingMutationLoading = false;
      })
      .addCase(deleteHeating.pending, (state) => {
        state.heatingMutationLoading = true;
      })
      .addCase(deleteHeating.fulfilled, (state) => {
        state.heatingMutationLoading = false;
        state.detail = null;
      })
      .addCase(deleteHeating.rejected, (state) => {
        state.heatingMutationLoading = false;
      })
      .addCase(finishHeating.pending, (state, action) => {
        const id = action.meta.arg.heatingId;
        state.itemMutationLoading[`finish-${id}`] = true;
      })
      .addCase(finishHeating.fulfilled, (state, action) => {
        const id = action.meta.arg.heatingId;
        delete state.itemMutationLoading[`finish-${id}`];
      })
      .addCase(finishHeating.rejected, (state, action) => {
        const id = action.meta?.arg?.heatingId;
        if (id != null) delete state.itemMutationLoading[`finish-${id}`];
      })
      .addCase(removeComponentLineFromHeating.pending, (state, action) => {
        const id = action.meta.arg.componentId;
        state.itemMutationLoading[`rm-${id}`] = true;
      })
      .addCase(removeComponentLineFromHeating.fulfilled, (state, action) => {
        const id = action.payload;
        delete state.itemMutationLoading[`rm-${id}`];
      })
      .addCase(removeComponentLineFromHeating.rejected, (state, action) => {
        const id = action.meta?.arg?.componentId;
        if (id != null) delete state.itemMutationLoading[`rm-${id}`];
      });
  },
});

export const {
  clearHeatingDetailError,
  setListFilters,
  resetListFiltersToToday,
} = heatingSlice.actions;
export default heatingSlice.reducer;
