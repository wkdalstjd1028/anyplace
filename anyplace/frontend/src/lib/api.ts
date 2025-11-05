// src/lib/api.ts

import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080',

    // OIDC 세션 쿠키를 주고받기 위한 설정 (이것은 필수!)
    withCredentials: true,
});

// ★★★
// .interceptors.response.use(...)
// 이 부분 전체를 삭제합니다.
// (401 오류 처리는 각 컴포넌트나 서비스에서 개별로 담당합니다.)
// ★★★

export default apiClient;