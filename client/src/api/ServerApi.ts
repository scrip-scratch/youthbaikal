import axios from "axios";

const server = "http://localhost:5050";
// const server = "https://youth-baikal.ru:5050";

export interface CreateParticipantDto {
  user_name: string;
  user_phone: string;
  first_time: boolean;
  city: string;
  church: string;
  email: string;
  paid: boolean;
  payment_amount: number;
  promo_code: string;
  promo_discount: number;
  payment_date?: string;
  letter_date?: string;
  birth_date?: string;
}

class ServerApi {
  public async getParticipants() {
    const endpoint = `${server}/participants`;

    try {
      return await axios.get(endpoint);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async getSingleParticipant(userId: string) {
    const endpoint = `${server}/participants/${userId}`;

    try {
      return await axios.get(endpoint);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async createUser(request: CreateParticipantDto) {
    const endpoint = `${server}/participants/create`;

    try {
      return await axios.post(endpoint, request);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async updateParticipant(params: {
    userId: string;
    data: CreateParticipantDto;
  }) {
    const endpoint = `${server}/participants/update/${params.userId}`;

    try {
      const response = await axios.put(endpoint, {
        userId: params.userId,
        token: localStorage.getItem("token"),
        ...params.data,
      });
      return response;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async admitParticipant(params: { userId: string; datetime: string }) {
    const endpoint = `${server}/participants/admit/${params.userId}`;

    try {
      const response = await axios.put(endpoint, {
        userId: params.userId,
        datetime: params.datetime,
        token: localStorage.getItem("token"),
      });
      return response;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async login(params: { login: string; password: string }) {
    const endpoint = `${server}/auth`;

    try {
      const response = await axios.post(endpoint, params);
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  public async validateToken(token: string) {
    const endpoint = `${server}/validate`;

    try {
      const response = await axios.post(endpoint, { token: token });
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  public async deleteParticipant(userId: string) {
    const endpoint = `${server}/participants/delete/${userId}`;

    try {
      const response = await axios.delete(endpoint, {
        data: {
          userId: userId,
          token: localStorage.getItem("token"),
        },
      });
      return response;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async uploadBill(userId: string, file: File) {
    const endpoint = `${server}/participants/upload-bill/${userId}`;

    try {
      const formData = new FormData();
      formData.append("bill", file);
      formData.append("token", localStorage.getItem("token") || "");

      const response = await axios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async downloadBill(userId: string) {
    const endpoint = `${server}/participants/download-bill/${userId}`;
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(endpoint, {
        params: { token },
        responseType: "blob",
      });
      return response;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export const serverApi = new ServerApi();
