# BackEnd를 위한 지침

### 아키텍처 관련 지침

- SOLID 원칙 반드시 준수할것
- Clean 아키텍처 반드치 적용할 것

### 로깅 지침

- 별도의 로깅 함수를 정의하고 이 함수를 이용해 로그를 남기도록 한다.
- 로그는 파일시스템이 아닌 콘솔에 로그를 출력한다.

### 에러 처리

- 서비스에서 `AppError` throw → 컨트롤러 `next(err)` → error middleware가 처리
- `AppError`는 `src/middleware/error.middleware.js`에서 import

### API 응답 형식

- 성공: `{ success: true, data: { ... } }`
- 실패: `{ success: false, message: "...", code: "..." }` (error middleware 자동 처리)

### 테스트 패턴

- 단위 테스트: `jest.resetModules()` + `jest.doMock()` 패턴 (기존 테스트 파일 참고)
- 통합 테스트: 실제 DB 사용, `afterAll`에서 테스트 데이터 반드시 cleanup
