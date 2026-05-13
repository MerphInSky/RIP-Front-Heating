export interface WebBackendInternalAppSerializerHeatingComponentJSON {
  heating_id?: number;
  component_id?: number;
  power_dissipation?: number;
  heat?: number;
}

export interface WebBackendInternalAppSerializerHeatingJSON {
  heating_id?: number;
  status?: string;
  created_at?: string;
  creator_login?: string;
  moderator_login?: string | null;
  forming_date?: string | null;
  finish_date?: string | null;
  title?: string | null;
  incomplete_items_count?: number;
  ambient_temperature?: number;
}

export interface WebBackendInternalAppSerializerComponentJSON {
  component_id?: number;
  is_deleted?: boolean;
  title?: string;
  description?: string;
  photo_url?: string;
  video?: string;
  thermal_resistance?: number;
  short_description_en?: string;
}

export interface WebBackendInternalAppSerializerSignInRequest {
  login: string;
  password: string;
}

export interface WebBackendInternalAppSerializerSignUpRequest {
  is_moderator?: boolean;
  login: string;
  password: string;
}

export interface WebBackendInternalAppSerializerSignUpResponse {
  is_moderator?: boolean;
  login?: string;
}

export interface WebBackendInternalAppSerializerStatusJSON {
  status?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  secure?: boolean;
  path: string;
  type?: ContentType;
  query?: QueryParamsType;
  format?: ResponseType;
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export const ContentType = {
  Json: "application/json",
  JsonApi: "application/vnd.api+json",
  FormData: "multipart/form-data",
  UrlEncoded: "application/x-www-form-urlencoded",
  Text: "text/plain",
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "//localhost:8080/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  heatingComponent = {
    postHeatingComponent: (componentId: number, params: RequestParams = {}) =>
      this.request<
        WebBackendInternalAppSerializerHeatingJSON,
        Record<string, string>
      >({
        path: `/heating_components/add/${componentId}`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    heatingComponentUpdate: (
      componentId: number,
      heatingId: number,
      data: WebBackendInternalAppSerializerHeatingComponentJSON,
      params: RequestParams = {},
    ) =>
      this.request<
        WebBackendInternalAppSerializerHeatingComponentJSON,
        Record<string, string>
      >({
        path: `/heating_components/${componentId}/${heatingId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    heatingComponentDelete: (
      componentId: number,
      heatingId: number,
      params: RequestParams = {},
    ) =>
      this.request<
        WebBackendInternalAppSerializerHeatingJSON,
        Record<string, string>
      >({
        path: `/heating_components/${componentId}/${heatingId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  component = {
    createComponentCreate: (
      component: WebBackendInternalAppSerializerComponentJSON,
      params: RequestParams = {},
    ) =>
      this.request<
        WebBackendInternalAppSerializerComponentJSON,
        Record<string, string>
      >({
        path: `/component/create-component`,
        method: "POST",
        body: component,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    componentDetail: (id: number, params: RequestParams = {}) =>
      this.request<
        WebBackendInternalAppSerializerComponentJSON,
        Record<string, string>
      >({
        path: `/component/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  heating = {
    allHeatingsList: (
      query?: {
        "from-date"?: string;
        "to-date"?: string;
        status?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        WebBackendInternalAppSerializerHeatingJSON[],
        Record<string, string>
      >({
        path: `/heatings`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    heatingCartList: (params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/heatings/cart`,
        method: "GET",
        format: "json",
        ...params,
      }),

    heatingDetail: (id: number, params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, string>>({
        path: `/heatings/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    deleteHeatingDelete: (
      id: number,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/heatings/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    editHeatingUpdate: (
      id: number,
      application: WebBackendInternalAppSerializerHeatingJSON,
      params: RequestParams = {},
    ) =>
      this.request<
        WebBackendInternalAppSerializerHeatingJSON,
        Record<string, string>
      >({
        path: `/heatings/${id}`,
        method: "PUT",
        body: application,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    finishHeatingUpdate: (
      id: number,
      status: WebBackendInternalAppSerializerStatusJSON,
      params: RequestParams = {},
    ) =>
      this.request<
        WebBackendInternalAppSerializerHeatingJSON,
        Record<string, string>
      >({
        path: `/heatings/${id}/finish`,
        method: "PUT",
        body: status,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    formHeatingUpdate: (id: number, params: RequestParams = {}) =>
      this.request<
        WebBackendInternalAppSerializerHeatingJSON,
        Record<string, string>
      >({
        path: `/heatings/${id}/form`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  components = {
    componentsList: (
      query?: {
        Title?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        WebBackendInternalAppSerializerComponentJSON[],
        Record<string, string>
      >({
        path: `/components`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  users = {
    signinCreate: (
      credentials: WebBackendInternalAppSerializerSignInRequest,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/users/signin`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    signoutCreate: (params: RequestParams = {}) =>
      this.request<void, Record<string, string>>({
        path: `/users/signout`,
        method: "POST",
        secure: true,
        ...params,
      }),

    signupCreate: (
      user: WebBackendInternalAppSerializerSignUpRequest,
      params: RequestParams = {},
    ) =>
      this.request<
        WebBackendInternalAppSerializerSignUpResponse,
        Record<string, string>
      >({
        path: `/users/signup`,
        method: "POST",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}